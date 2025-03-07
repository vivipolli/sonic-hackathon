import json
from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import logging
import asyncio
import signal
import threading
from pathlib import Path
from src.cli import ZerePyCLI
from datetime import datetime, timezone

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("server/app")

class ActionRequest(BaseModel):
    """Request model for agent actions"""
    connection: str
    action: str
    params: Optional[List[str]] = []

class ConfigureRequest(BaseModel):
    """Request model for configuring connections"""
    connection: str
    params: Optional[Dict[str, Any]] = {}

class BehaviorRequest(BaseModel):
    current_behavior: str
    trigger_situations: str
    consequences: str
    previous_attempts: str
    user_id: str

class ServerState:
    """Simple state management for the server"""
    def __init__(self):
        self.cli = ZerePyCLI()
        self.agent_running = False
        self.agent_task = None
        self._stop_event = threading.Event()

    async def load_agent(self, name: str) -> bool:
        """Load an agent by name"""
        try:
            self.cli._load_agent_from_file(name)
            return True
        except Exception as e:
            logger.error(f"Error loading agent {name}: {e}")
            return False

    def _run_agent_loop(self):
        """Run agent loop in a separate thread"""
        try:
            log_once = False
            while not self._stop_event.is_set():
                if self.cli.agent:
                    try:
                        if not log_once:
                            logger.info("Loop logic not implemented")
                            log_once = True

                    except Exception as e:
                        logger.error(f"Error in agent action: {e}")
                        if self._stop_event.wait(timeout=30):
                            break
        except Exception as e:
            logger.error(f"Error in agent loop thread: {e}")
        finally:
            self.agent_running = False
            logger.info("Agent loop stopped")

    async def start_agent_loop(self):
        """Start the agent loop in background thread"""
        if not self.cli.agent:
            raise ValueError("No agent loaded")
        
        if self.agent_running:
            raise ValueError("Agent already running")

        self.agent_running = True
        self._stop_event.clear()
        self.agent_task = threading.Thread(target=self._run_agent_loop)
        self.agent_task.start()

    async def stop_agent_loop(self):
        """Stop the agent loop"""
        if self.agent_running:
            self._stop_event.set()
            if self.agent_task:
                self.agent_task.join(timeout=5)
            self.agent_running = False

class ZerePyServer:
    def __init__(self):
        self.app = FastAPI(title="ZerePy Server")
        self.state = ServerState()
        
        # Add CORS middleware
        self.app.add_middleware(
            CORSMiddleware,
            allow_origins=["http://localhost:5173"], 
            allow_methods=["*"],  
            allow_headers=["*"],  
        )
        
        self.setup_routes()

    def setup_routes(self):
        @self.app.get("/")
        async def root():
            """Server status endpoint"""
            return {
                "status": "running",
                "agent": self.state.cli.agent.name if self.state.cli.agent else None,
                "agent_running": self.state.agent_running
            }

        @self.app.get("/agents")
        async def list_agents():
            """List available agents"""
            try:
                agents = []
                agents_dir = Path("agents")
                if agents_dir.exists():
                    for agent_file in agents_dir.glob("*.json"):
                        if agent_file.stem != "general":
                            agents.append(agent_file.stem)
                return {"agents": agents}
            except Exception as e:
                raise HTTPException(status_code=500, detail=str(e))

        @self.app.post("/agents/{name}/load")
        async def load_agent(name: str):
            """Load a specific agent"""
            try:
                self.state.cli._load_agent_from_file(name)
                return {
                    "status": "success",
                    "agent": name
                }
            except Exception as e:
                raise HTTPException(status_code=400, detail=str(e))

        @self.app.get("/connections")
        async def list_connections():
            """List all available connections"""
            if not self.state.cli.agent:
                raise HTTPException(status_code=400, detail="No agent loaded")
            
            try:
                connections = {}
                for name, conn in self.state.cli.agent.connection_manager.connections.items():
                    connections[name] = {
                        "configured": conn.is_configured(),
                        "is_llm_provider": conn.is_llm_provider
                    }
                return {"connections": connections}
            except Exception as e:
                raise HTTPException(status_code=500, detail=str(e))

        @self.app.post("/agent/action")
        async def agent_action(action_request: ActionRequest):
            """Execute a single agent action"""
            if not self.state.cli.agent:
                raise HTTPException(status_code=400, detail="No agent loaded")
            
            try:
                result = await asyncio.to_thread(
                    self.state.cli.agent.perform_action,
                    connection=action_request.connection,
                    action=action_request.action,
                    params=action_request.params
                )
                return {"status": "success", "result": result}
            except Exception as e:
                raise HTTPException(status_code=400, detail=str(e))

        @self.app.post("/agent/start")
        async def start_agent():
            """Start the agent loop"""
            if not self.state.cli.agent:
                raise HTTPException(status_code=400, detail="No agent loaded")
            
            try:
                await self.state.start_agent_loop()
                return {"status": "success", "message": "Agent loop started"}
            except Exception as e:
                raise HTTPException(status_code=400, detail=str(e))

        @self.app.post("/agent/stop")
        async def stop_agent():
            """Stop the agent loop"""
            try:
                await self.state.stop_agent_loop()
                return {"status": "success", "message": "Agent loop stopped"}
            except Exception as e:
                raise HTTPException(status_code=400, detail=str(e))
        
        @self.app.post("/connections/{name}/configure")
        async def configure_connection(name: str, config: ConfigureRequest):
            """Configure a specific connection"""
            if not self.state.cli.agent:
                raise HTTPException(status_code=400, detail="No agent loaded")
            
            try:
                connection = self.state.cli.agent.connection_manager.connections.get(name)
                if not connection:
                    raise HTTPException(status_code=404, detail=f"Connection {name} not found")
                
                success = connection.configure(**config.params)
                if success:
                    return {"status": "success", "message": f"Connection {name} configured successfully"}
                else:
                    raise HTTPException(status_code=400, detail=f"Failed to configure {name}")
                    
            except Exception as e:
                raise HTTPException(status_code=500, detail=str(e))

        @self.app.get("/connections/{name}/status")
        async def connection_status(name: str):
            """Get configuration status of a connection"""
            if not self.state.cli.agent:
                raise HTTPException(status_code=400, detail="No agent loaded")
                
            try:
                connection = self.state.cli.agent.connection_manager.connections.get(name)
                if not connection:
                    raise HTTPException(status_code=404, detail=f"Connection {name} not found")
                    
                return {
                    "name": name,
                    "configured": connection.is_configured(verbose=True),
                    "is_llm_provider": connection.is_llm_provider
                }
                
            except Exception as e:
                raise HTTPException(status_code=500, detail=str(e))

        @self.app.post("/analyze")
        async def analyze_behavior(request: BehaviorRequest):
            """Analyze behavior and suggest habits"""
            if not self.state.cli.agent:
                if not await self.state.load_agent("mentalhealthai"):
                    raise HTTPException(status_code=400, detail="No agent loaded. Please load an agent first.")
            
            try:
                # Prepare user data for storage
                user_responses = {
                    "current_behavior": request.current_behavior,
                    "trigger_situations": request.trigger_situations,
                    "consequences": request.consequences,
                    "previous_attempts": request.previous_attempts
                }

                # Use suggest-daily-habits action directly
                health_metrics = {
                    "Current Behavior": request.current_behavior,
                    "Trigger Situations": request.trigger_situations,
                    "Consequences": request.consequences,
                    "Previous Attempts": request.previous_attempts
                }
                
                logger.info("Calling suggest-daily-habits action")
                result = await asyncio.wait_for(
                    asyncio.to_thread(
                        self.state.cli.agent.perform_action,
                        connection="eternalai",
                        action="suggest-daily-habits",
                        params=[json.dumps(health_metrics)]
                    ),
                    timeout=100.0
                )
                
                if not result:
                    raise HTTPException(status_code=400, detail="Failed to generate analysis")
                
                try:
                    storage_data = {
                        "user_id": request.user_id,
                        "responses": user_responses,
                        "analysis": result,
                        "timestamp": datetime.now(timezone.utc).isoformat()
                    }
                    
                    tx_hash = await asyncio.to_thread(
                        self.state.cli.agent.perform_action,
                        connection="sonic",
                        action="store-data",
                        params=[json.dumps(storage_data), "behavior_analysis"]
                    )
                    
                    if not tx_hash:
                        raise Exception("Failed to store data on blockchain")
                        
                    return {
                        "status": "success",
                        "analysis": result,
                        "message": "Behavioral analysis completed and stored successfully",
                        "blockchain_tx": tx_hash,
                        "user_responses": user_responses
                    }
                    
                except Exception as e:
                    logger.error(f"Failed to store analysis on blockchain: {e}")
                    raise HTTPException(
                        status_code=500, 
                        detail="Analysis completed but storage failed"
                    )
                    
            except asyncio.TimeoutError:
                logger.error("Request to EternalAI timed out")
                raise HTTPException(status_code=504, detail="Request timed out")
            except Exception as e:
                logger.error(f"Error in analyze_behavior: {e}")
                raise HTTPException(status_code=500, detail=str(e))

        @self.app.patch("/habits/{habit_id}")
        async def update_habit(habit_id: str, user_id: str, completed: bool):
            """Update habit completion status"""
            if not self.state.cli.agent:
                raise HTTPException(status_code=400, detail="No agent loaded")
            
            try:
                habit_data = {
                    "user_id": user_id,
                    "habit_id": habit_id,
                    "completed": completed,
                    "timestamp": datetime.now(timezone.utc).isoformat()
                }
                
                tx_hash = await asyncio.to_thread(
                    self.state.cli.agent.perform_action,
                    connection="sonic",
                    action="store-data",
                    params=[json.dumps(habit_data), "habit_completion"]
                )

                if not tx_hash:
                    raise Exception("Failed to store data on blockchain")

                return {
                    "status": "success",
                    "message": "Habit update stored successfully",
                    "blockchain_tx": tx_hash
                }
            except Exception as e:
                logger.error(f"Error updating habit: {e}")
                raise HTTPException(status_code=500, detail=str(e))

        @self.app.get("/habits/progress/{user_id}")
        async def get_progress(user_id: str):
            """Get habit progress for a user"""
            if not self.state.cli.agent:
                raise HTTPException(status_code=400, detail="No agent loaded")
            
            try:
                stored_data = await asyncio.to_thread(
                    self.state.cli.agent.perform_action,
                    connection="sonic",
                    action="get-stored-data",
                    params=[user_id, "habit_completion"]  
                )
                
                if stored_data is None:
                    raise HTTPException(status_code=500, detail="Failed to retrieve data from blockchain")
                    
                return {
                    "status": "success",
                    "habits": stored_data
                }
            except Exception as e:
                logger.error(f"Error getting habit progress: {e}")
                raise HTTPException(status_code=500, detail=str(e))

        @self.app.get("/user/responses/{user_id}")
        async def get_user_responses(user_id: str, tx_hash: str):
            """Get user's questionnaire responses"""
            if not self.state.cli.agent:
                raise HTTPException(status_code=400, detail="No agent loaded")
            
            if not tx_hash:
                raise HTTPException(status_code=400, detail="Transaction hash is required")
            
            try:
                stored_data = await asyncio.to_thread(
                    self.state.cli.agent.perform_action,
                    connection="sonic",
                    action="get-stored-data",
                    params=[user_id, "behavior_analysis", tx_hash]
                )
                
                logger.info(f"Raw stored data: {json.dumps(stored_data, indent=2)}")
                
                if not stored_data:
                    logger.warning("No stored data found")
                    return {
                        "status": "success",
                        "message": "No responses found for this transaction",
                        "responses": []
                    }
                
                # Process data to extract responses and analyses
                user_responses = []
                for entry in stored_data:
                    try:
                        logger.info(f"Processing entry: {json.dumps(entry, indent=2)}")
                        data = entry["data"]
                        
                        response_entry = {
                            "timestamp": entry["timestamp"],
                            "tx_hash": entry["tx_hash"],
                            "responses": data.get("responses", {}),
                            "analysis": data.get("analysis", "")
                        }
                        user_responses.append(response_entry)
                        logger.info("Entry added to responses")
                        
                    except Exception as e:
                        logger.warning(f"Failed to process entry: {str(e)}")
                        continue
                
                if not user_responses:
                    return {
                        "status": "success",
                        "message": "No responses found for this transaction",
                        "responses": []
                    }
                    
                return {
                    "status": "success",
                    "user_id": user_id,
                    "responses": user_responses
                }
                
            except Exception as e:
                logger.error(f"Error retrieving user responses: {e}")
                raise HTTPException(status_code=500, detail=str(e))

def create_app():
    server = ZerePyServer()
    return server.app