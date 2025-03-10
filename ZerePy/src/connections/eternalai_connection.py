import logging
import os
import json
from typing import Dict, Any
from dotenv import load_dotenv, set_key
from openai import OpenAI
from src.connections.base_connection import BaseConnection, Action, ActionParameter
from web3 import Web3
import requests
from src.prompts import ANALYZE_AND_SUGGEST_PROMPT

logger = logging.getLogger("connections.eternalai_connection")
IPFS = "ipfs://"
LIGHTHOUSE_IPFS = "https://gateway.lighthouse.storage/ipfs/"
GCS_ETERNAL_AI_BASE_URL = "https://cdn.eternalai.org/upload/"
AGENT_CONTRACT_ABI = [{"inputs": [{"internalType": "uint256","name": "_agentId","type": "uint256"}],"name": "getAgentSystemPrompt","outputs": [{"internalType": "bytes[]","name": "","type": "bytes[]"}],"stateMutability": "view","type": "function"}]

class EternalAIConnectionError(Exception):
    """Base exception for EternalAI connection errors"""
    pass


class EternalAIConfigurationError(EternalAIConnectionError):
    """Raised when there are configuration/credential issues"""
    pass


class EternalAIAPIError(EternalAIConnectionError):
    """Raised when EternalAI API requests fail"""
    pass


class EternalAIConnection(BaseConnection):
    def __init__(self, config: Dict[str, Any]):
        super().__init__(config)
        self._client = None

    @property
    def is_llm_provider(self) -> bool:
        return True

    def validate_config(self, config: Dict[str, Any]) -> Dict[str, Any]:
        """Validate EternalAI configuration from JSON"""
        required_fields = ["model"]
        missing_fields = [field for field in required_fields if field not in config]

        if missing_fields:
            raise ValueError(f"Missing required configuration fields: {', '.join(missing_fields)}")

        if not isinstance(config["model"], str):
            raise ValueError("model must be a string")

        return config

    def register_actions(self) -> None:
        """Register available EternalAI actions"""
        self.actions = {
            "check-model": Action(
                name="check-model",
                parameters=[
                    ActionParameter("model", True, str, "Model name to check availability")
                ],
                description="Check if a specific model is available"
            ),
            "list-models": Action(
                name="list-models",
                parameters=[],
                description="List all available EternalAI models"
            ),
            "suggest-daily-habits": Action(
                name="suggest-daily-habits",
                parameters=[
                    ActionParameter("health_metrics", True, str, "Health metrics in JSON format")
                ],
                description="Analyze health metrics and suggest personalized daily habits"
            )
        }

    def _get_client(self) -> OpenAI:
        """Get or create EternalAI client"""
        if not self._client:
            api_key = os.getenv("EternalAI_API_KEY")
            api_url = os.getenv("EternalAI_API_URL")
            if not api_key or not api_url:
                raise EternalAIConfigurationError("EternalAI credentials not found in environment")
            self._client = OpenAI(api_key=api_key, base_url=api_url)
        return self._client

    def configure(self) -> bool:
        """Sets up EternalAI API authentication"""
        logger.info("\n🤖 EternalAI API SETUP")

        if self.is_configured():
            logger.info("\nEternalAI API is already configured.")
            response = input("Do you want to reconfigure? (y/n): ")
            if response.lower() != 'y':
                return True

        logger.info("\n📝 To get your EternalAI credentials:")
        logger.info("1. Visit https://eternalai.org/api")
        logger.info("2. Generate an API Key")
        logger.info("3. Use API url as https://api.eternalai.org/v1/")

        api_key = input("\nEnter your EternalAI API key: ")
        api_url = input("\nEnter your EternalAI API url: ")

        try:
            if not os.path.exists('.env'):
                with open('.env', 'w') as f:
                    f.write('')

            set_key('.env', 'EternalAI_API_KEY', api_key)
            set_key('.env', 'EternalAI_API_URL', api_url)

            # Validate credentials
            client = OpenAI(api_key=api_key, base_url=api_url)
            client.models.list()

            logger.info("\n✅ EternalAI API configuration successfully saved!")
            logger.info("Your credentials have been stored in the .env file.")
            return True

        except Exception as e:
            logger.error(f"Configuration failed: {e}")
            return False

    def is_configured(self, verbose=False) -> bool:
        """Check if EternalAI API credentials are configured and valid"""
        try:
            load_dotenv()
            api_key = os.getenv('EternalAI_API_KEY')
            api_url = os.getenv('EternalAI_API_URL')
            if not api_key or not api_url:
                return False

            client = OpenAI(api_key=api_key, base_url=api_url)
            client.models.list()
            return True

        except Exception as e:
            if verbose:
                logger.debug(f"Configuration check failed: {e}")
            return False

    @staticmethod
    def get_on_chain_system_prompt_content(on_chain_data: str) -> str:
        if IPFS in on_chain_data:
            light_house = on_chain_data.replace(IPFS, LIGHTHOUSE_IPFS)
            response = requests.get(light_house)
            if response.status_code == 200:
                return response.text
            else:
                gcs = on_chain_data.replace(IPFS, GCS_ETERNAL_AI_BASE_URL)
                response = requests.get(gcs)
                if response.status_code == 200:
                    return response.text
                else:
                    raise Exception(f"invalid on-chain system prompt response status{response.status_code}")
        else:
            if len(on_chain_data) > 0:
                return on_chain_data
            else:
                raise Exception(f"invalid on-chain system prompt")

    def generate_text(self, prompt: str, system_prompt: str, model: str = None, chain_id: str = None, **kwargs) -> str:
        """Generate text using EternalAI models"""
        try:
            client = self._get_client()
            model = model or self.config["model"]
            logger.info(f"model {model}")

            chain_id = chain_id or self.config["chain_id"]
            if not chain_id or chain_id == "":
                chain_id = "45762"
            logger.info(f"chain_id {chain_id}")

            stream = self.config.get("stream", False)
            logger.info(f"Sending to API - Messages: {[{'role': 'system', 'content': system_prompt}, {'role': 'user', 'content': prompt}]}")

            completion = client.chat.completions.create(
                model=model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": prompt},
                ],
                extra_body={"chain_id": chain_id},
                stream=stream,
                timeout=180.0
            )

            if not stream:
                if completion.choices is None:
                    raise EternalAIAPIError("Text generation failed: no choices in response")
                return completion.choices[0].message.content
            else:
                content = ""
                for chunk in completion:
                    if chunk.choices is not None:
                        delta = chunk.choices[0].delta
                        if delta is not None and delta.content is not None:
                            content += delta.content
                return content

        except Exception as e:
            raise EternalAIAPIError(f"Text generation failed: {e}")

    def check_model(self, model: str, **kwargs) -> bool:
        """Check if a specific model is available"""
        try:
            client = self._get_client()
            try:
                client.models.retrieve(model=model)
                return True
            except Exception:
                return False
        except Exception as e:
            raise EternalAIAPIError(f"Model check failed: {e}")

    def list_models(self, **kwargs) -> None:
        """List all available EternalAI models"""
        try:
            client = self._get_client()
            response = client.models.list().data

            # Filter for fine-tuned models
            fine_tuned_models = [
                model for model in response
                if model.owned_by in ["organization", "user", "organization-owner"]
            ]

            if fine_tuned_models:
                logger.info("\nFINE-TUNED MODELS:")
                for i, model in enumerate(fine_tuned_models):
                    logger.info(f"{i + 1}. {model.id}")

        except Exception as e:
            raise EternalAIAPIError(f"Listing models failed: {e}")

    def perform_action(self, action_name: str, kwargs) -> Any:
        """Execute an action with validation"""
        if action_name not in self.actions:
            raise KeyError(f"Unknown action: {action_name}")

        action = self.actions[action_name]
        errors = action.validate_params(kwargs)
        if errors:
            raise ValueError(f"Invalid parameters: {', '.join(errors)}")

        method_name = action_name.replace('-', '_')
        method = getattr(self, method_name)
        return method(**kwargs)

    def suggest_daily_habits(self, health_metrics: str) -> str:
        """Analyze health metrics and suggest personalized daily habits"""
        try:
            # Log received data
            logger.info(f"Received health_metrics: {health_metrics}")

            # Format health data
            metrics = json.loads(health_metrics)
            prompt = ANALYZE_AND_SUGGEST_PROMPT.format(
                behavior=metrics.get('Current Behavior'),
                antecedent=metrics.get('Trigger Situations'),
                consequence=metrics.get('Consequences'),
                previous_attempts=metrics.get('Previous Attempts')
            )

            # Log formatted prompt
            logger.info(f"Formatted prompt: {prompt}")

            # Temporarily save and modify stream configuration
            original_stream = self.config.get("stream", True)
            self.config["stream"] = False

            try:
                # Call generate_text with specific system prompt
                result = self.generate_text(
                    prompt=prompt,
                    system_prompt="You are a health and wellness expert, focused on helping people develop healthy and sustainable habits. Your suggestions are practical, evidence-based, and tailored to individual needs.",
                    model=self.config.get("model"),
                    chain_id=self.config.get("chain_id", "45762")
                )

                # Verify and clean response
                if result:
                    result = result.strip()
                    if result:
                        return result
                    
                logger.error("Empty response from API")
                raise EternalAIAPIError("Empty response from API")

            finally:
                # Restore original stream configuration
                self.config["stream"] = original_stream

        except Exception as e:
            logger.error(f"Error in suggest_daily_habits: {str(e)}")
            logger.error(f"Full exception: {repr(e)}")
            raise EternalAIAPIError(f"Failed to generate suggestions: {str(e)}")
