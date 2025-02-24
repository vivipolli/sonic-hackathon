from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Dict, Any
from src.server.client import ZerePyClient

app = FastAPI(title="ZerePy API", description="API for behavioral analysis and habit suggestions")

class BehaviorRequest(BaseModel):
    current_behavior: str
    trigger_situations: str
    consequences: str
    previous_attempts: str

@app.get("/")
async def root():
    """API status endpoint"""
    return {"status": "online", "service": "ZerePy Behavior Analysis API"}

@app.post("/analyze")
async def analyze_behavior(request: BehaviorRequest) -> Dict[str, Any]:
    """
    Analyzes behavior and suggests habits
    
    Example request:
    {
        "current_behavior": "Difficulty maintaining a healthy routine",
        "trigger_situations": "Stress and poor sleep",
        "consequences": "Lack of exercise and irregular meals",
        "previous_attempts": "Tried fixed schedules but couldn't maintain"
    }
    """
    try:
        # Inicializa o cliente
        client = ZerePyClient("http://localhost:8000")

        # Prepara os parâmetros no formato esperado
        params = {
            "Current Behavior": request.current_behavior,
            "Trigger Situations": request.trigger_situations,
            "Consequences": request.consequences,
            "Previous Attempts": request.previous_attempts
        }

        # Executa a análise
        response = client.perform_action(
            connection="eternalai",
            action="suggest-daily-habits",
            params=params
        )

        return {
            "status": "success",
            "analysis": response.get("result", ""),
            "message": "Behavioral analysis completed successfully"
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error performing behavioral analysis: {str(e)}"
        ) 