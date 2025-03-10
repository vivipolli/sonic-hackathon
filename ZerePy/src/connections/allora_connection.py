import logging
from typing import List, Dict, Any
from dotenv import set_key, load_dotenv
from allora_sdk.v2.api_client import AlloraAPIClient, ChainSlug, SignatureFormat
from src.connections.base_connection import BaseConnection, Action, ActionParameter
import os
import asyncio
import json
import time
import uuid

logger = logging.getLogger("connections.allora_connection")

class AlloraConnectionError(Exception):
    """Base exception for Allora connection errors"""
    pass

class AlloraConfigurationError(AlloraConnectionError):
    """Raised when there are configuration/credential issues"""
    pass

class AlloraAPIError(AlloraConnectionError):
    """Raised when Allora API requests fail"""
    pass

class AlloraConnection(BaseConnection):
    def __init__(self, config: Dict[str, Any]):
        super().__init__(config)
        self._client = None
        self.chain_slug = config.get("chain_slug", ChainSlug.TESTNET)
        self.topic_id = config.get("topic_id", 30)  # Default to topic 30 (ETH/USD - 5min Price Prediction)
        
        self.feedback_store = config.get("feedback_store", {})
        self.local_storage_path = os.path.join(os.path.dirname(__file__), "../../data/allora_feedback.json")
        self._load_local_storage()

    def _load_local_storage(self):
        """Load feedback data from local storage"""
        try:
            if os.path.exists(self.local_storage_path):
                with open(self.local_storage_path, 'r') as f:
                    self.feedback_store = json.load(f)
            else:
                self.feedback_store = {
                    "feedbacks": [],
                    "insights": {
                        "averageEffectiveness": 0,
                        "topHabits": [],
                        "totalFeedbackCount": 0,
                        "lastUpdated": ""
                    }
                }
                os.makedirs(os.path.dirname(self.local_storage_path), exist_ok=True)
                self._save_local_storage()
        except Exception as e:
            logger.error(f"Error loading local storage: {str(e)}")
            self.feedback_store = {"feedbacks": [], "insights": {}}

    def _save_local_storage(self):
        """Save feedback data to local storage"""
        try:
            with open(self.local_storage_path, 'w') as f:
                json.dump(self.feedback_store, f, indent=2)
        except Exception as e:
            logger.error(f"Error saving to local storage: {str(e)}")

    @property
    def is_llm_provider(self) -> bool:
        return False

    def _get_client(self) -> AlloraAPIClient:
        """Get or create Allora client"""
        if not self._client:
            api_key = os.getenv("ALLORA_API_KEY")
            if not api_key:
                raise AlloraConfigurationError("Allora API key not found in environment")
            self._client = AlloraAPIClient(
                chain_slug=self.chain_slug,
                api_key=api_key
            )
        return self._client

    def register_actions(self) -> None:
        """Register available Allora actions"""
        actions = [
            Action(
                name="get-inference",
                parameters=[
                    ActionParameter("topic_id", True, int, "Topic ID to get inference for")
                ],
                description="Get inference from Allora Network for a specific topic"
            ),
            Action(
                name="list-topics",
                parameters=[],
                description="List all available Allora Network topics"
            ),
            Action(
                name="submit-habit-feedback",
                parameters=[
                    ActionParameter("habit_id", True, str, "ID of the habit"),
                    ActionParameter("patient_id", True, str, "ID of the patient"),
                    ActionParameter("effectiveness", True, int, "Effectiveness rating (1-5)"),
                    ActionParameter("feedback", False, str, "Textual feedback about the habit"),
                    ActionParameter("implementation_duration", False, int, "Days the habit was implemented")
                ],
                description="Submit feedback about a habit's effectiveness"
            ),
            Action(
                name="get-collective-insights",
                parameters=[],
                description="Get collective insights about habit effectiveness from the network"
            )
        ]
        self.actions = {action.name: action for action in actions}

    def _make_request(self, method_name: str, *args, **kwargs) -> Any:
        """Make API request with error handling"""
        try:
            client = self._get_client()
            method = getattr(client, method_name)
            
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            try:
                response = loop.run_until_complete(method(*args, **kwargs))
                return response
            finally:
                loop.close()
                
        except Exception as e:
            raise AlloraAPIError(f"API request failed: {str(e)}")

    def get_inference(self, topic_id: int) -> Dict[str, Any]:
        """Get inference from Allora Network for a specific topic"""
        try:
            response = self._make_request('get_inference_by_topic_id', topic_id)
            return {
                "topic_id": topic_id,
                "inference": response.inference_data.network_inference_normalized
            }
        except Exception as e:
            raise AlloraAPIError(f"Failed to get inference: {str(e)}")

    def list_topics(self) -> List[Dict[str, Any]]:
        """List all available Allora Network topics"""
        try:
            return self._make_request('get_all_topics')
        except Exception as e:
            raise AlloraAPIError(f"Failed to list topics: {str(e)}")

    def submit_habit_feedback(self, habit_id: str, patient_id: str, effectiveness: int, 
                            feedback: str = "", implementation_duration: int = 0) -> Dict[str, Any]:
        """Submit feedback about a habit's effectiveness"""
        try:
            logger.info(f"Submitting feedback for habit {habit_id} from patient {patient_id}")
            
            if effectiveness < 1 or effectiveness > 5:
                logger.error(f"Invalid effectiveness rating: {effectiveness}. Must be between 1-5.")
                return {"error": "Effectiveness rating must be between 1-5"}
            
            feedback_entry = {
                "id": str(uuid.uuid4()),
                "habit_id": habit_id,
                "patient_id": patient_id,
                "effectiveness": effectiveness,
                "feedback": feedback,
                "implementation_duration": implementation_duration,
                "timestamp": time.strftime("%Y-%m-%d %H:%M:%S", time.localtime())
            }
            
            logger.info(f"Adding feedback to local storage: {feedback_entry}")
            self.feedback_store["feedbacks"].append(feedback_entry)
            
            self._update_insights()
            self._save_local_storage()
            
            logger.info("Feedback submitted successfully")
            return {
                "status": "success",
                "message": "Feedback submitted successfully",
                "feedback_id": feedback_entry["id"]
            }
            
        except Exception as e:
            logger.error(f"Error submitting habit feedback: {str(e)}")
            return {
                "status": "error",
                "message": f"Failed to submit feedback: {str(e)}"
            }

    def _update_insights(self):
        """Update insights based on feedback data"""
        feedbacks = self.feedback_store["feedbacks"]
        if not feedbacks:
            return
        
        total_effectiveness = sum(f["effectiveness"] for f in feedbacks)
        avg_effectiveness = total_effectiveness / len(feedbacks)
        
        habit_effectiveness = {}
        for f in feedbacks:
            habit_id = f["habit_id"]
            if habit_id not in habit_effectiveness:
                habit_effectiveness[habit_id] = {"total": 0, "count": 0, "feedbacks": []}
            
            habit_effectiveness[habit_id]["total"] += f["effectiveness"]
            habit_effectiveness[habit_id]["count"] += 1
            habit_effectiveness[habit_id]["feedbacks"].append(f["feedback"])
        
        for habit_id, data in habit_effectiveness.items():
            data["average"] = data["total"] / data["count"]
        
        sorted_habits = sorted(
            [{"habit_id": k, **v} for k, v in habit_effectiveness.items()],
            key=lambda x: x["average"],
            reverse=True
        )
        
        self.feedback_store["insights"] = {
            "averageEffectiveness": round(avg_effectiveness, 2),
            "topHabits": sorted_habits[:5],  # Top 5 habits
            "totalFeedbackCount": len(feedbacks),
            "lastUpdated": time.strftime("%Y-%m-%d %H:%M:%S", time.localtime())
        }

    def get_collective_insights(self) -> Dict[str, Any]:
        """Get collective insights about habit effectiveness"""
        try:
            # For hackathon: Return locally stored insights
            if not self.feedback_store.get("insights"):
                return self._get_default_insights()
            
            # Try to get real inference from Allora (for demo purposes)
            try:
                inference = self._make_request(
                    'get_inference_by_topic_id',
                    self.topic_id,
                    SignatureFormat.ETHEREUM_SEPOLIA
                )
                allora_data = inference.inference_data.network_inference_normalized
            except Exception as e:
                logger.warning(f"Could not get Allora inference: {str(e)}")
                allora_data = "Not available"
            
            return {
                **self.feedback_store["insights"],
                "allora_inference": allora_data
            }
                
        except Exception as e:
            logger.error(f"Failed to get collective insights: {str(e)}")
            return self._get_default_insights()

    def _get_default_insights(self) -> Dict[str, Any]:
        """Get default insights when no data is available"""
        return {
            "averageEffectiveness": 0,
            "topHabits": [],
            "totalFeedbackCount": 0,
            "lastUpdated": "",
            "message": "No collective insights available yet. Be the first to contribute!"
        }

    def configure(self) -> bool:
        """Sets up Allora API authentication"""
        print("\n🔮 ALLORA API SETUP")
        
        if self.is_configured():
            print("\nAllora API is already configured.")
            response = input("Do you want to reconfigure? (y/n): ")
            if response.lower() != 'y':
                return True

        try:
            api_key = input("\nEnter your Allora API key: ").strip()
            if not api_key:
                raise AlloraConfigurationError("API key cannot be empty")

            set_key('.env', 'ALLORA_API_KEY', api_key)
            print("\n✅ Allora API key saved successfully!")
            return True
            
        except Exception as e:
            logger.error(f"Configuration failed: {e}")
            return False

    def validate_config(self, config: Dict[str, Any]) -> Dict[str, Any]:
        """Validate Allora configuration from JSON"""
        return config

    def is_configured(self, verbose: bool = False) -> bool:
        """Check if Allora API is configured"""
        load_dotenv(override=True)
        
        api_key = os.getenv("ALLORA_API_KEY")
        if verbose:
            if not api_key:
                logger.info("\n❌ Allora API key not found in environment")
            else:
                logger.info("\n✅ Allora API key found")
        
        if not api_key and os.path.exists('.env'):
            try:
                with open('.env', 'r') as f:
                    for line in f:
                        if line.startswith('ALLORA_API_KEY='):
                            return True
            except Exception as e:
                logger.error(f"Error reading .env file: {e}")
        
        return bool(api_key)

    def perform_action(self, action_name: str, kwargs) -> Any:
        """Execute an action with validation"""
        try:
            if action_name not in self.actions:
                raise KeyError(f"Unknown action: {action_name}")

            action = self.actions[action_name]
            
            logger.info(f"Performing action {action_name} with params: {kwargs}")
            
            if not isinstance(kwargs, dict):
                logger.warning(f"kwargs is not a dictionary: {type(kwargs)}")
                if isinstance(kwargs, list):
                    param_names = [p.name for p in action.parameters]
                    kwargs_dict = {}
                    for i, value in enumerate(kwargs):
                        if i < len(param_names):
                            kwargs_dict[param_names[i]] = value
                    kwargs = kwargs_dict
                    logger.info(f"Converted kwargs to dictionary: {kwargs}")
                else:
                    kwargs = {}
            
            errors = action.validate_params(kwargs)
            if errors:
                error_msg = f"Invalid parameters: {', '.join(errors)}"
                logger.error(error_msg)
                raise ValueError(error_msg)

            method_name = action_name.replace('-', '_')
            method = getattr(self, method_name)
            
            result = method(**kwargs)
            logger.info(f"Action {action_name} completed successfully")
            return result
            
        except Exception as e:
            logger.error(f"Error in perform_action: {str(e)}")
            return {
                "status": "error",
                "message": str(e)
            }