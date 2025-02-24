from fastapi import FastAPI, HTTPException
from allora_sdk import AlloraClient
from web3 import Web3
from typing import Dict, List
import uvicorn
from datetime import datetime

from src.services.anamnese import AnamneseService, AnamneseData
from src.services.habits import HabitService

app = FastAPI()

# Configurações
SONIC_RPC_URL = "https://rpc.sonic.network"
PRIVATE_KEY = "SUA_CHAVE_PRIVADA"
CONTRACT_ADDRESS = "0xSeuContratoNaSonic"
ALLORA_API_KEY = "SUA_CHAVE_ALLORA"

# Inicialização dos serviços
w3 = Web3(Web3.HTTPProvider(SONIC_RPC_URL))
allora = AlloraClient(api_key=ALLORA_API_KEY)

# Armazenamento temporário em memória (substituir por blockchain)
temp_storage = {
    "plans": {},
    "habits": {}
}

class MockDBService:
    """
    Serviço temporário - será substituído por banco de dados no futuro
    Por enquanto, usaremos apenas para manter a estrutura do código
    """
    async def save_habit_plan(self, plan): 
        # Futuramente: Salvar configurações específicas no banco
        pass
    
    async def get_habit_plan(self, user_id): 
        # Futuramente: Recuperar configurações do banco
        pass
    
    async def update_habit(self, habit_id, data): 
        pass
    
    async def get_habits_by_date(self, user_id, date): 
        pass
    
    async def get_habits_by_date_range(self, user_id, start_date, end_date): 
        pass

class BlockchainService:
    def __init__(self, w3, contract_address, private_key):
        self.w3 = w3
        self.contract_address = contract_address
        self.private_key = private_key

    async def record_habit_completion(self, data: Dict):
        """
        Registra a conclusão do hábito na blockchain
        """
        try:
            tx = {
                "to": self.contract_address,
                "value": 0,
                "gas": 2000000,
                "gasPrice": self.w3.to_wei("10", "gwei"),
                "nonce": self.w3.eth.get_transaction_count(
                    self.w3.eth.account.from_key(self.private_key).address
                ),
                "data": self.w3.to_hex(text=str(data))
            }
            signed_tx = self.w3.eth.account.sign_transaction(tx, self.private_key)
            tx_hash = self.w3.eth.send_raw_transaction(signed_tx.rawTransaction)
            return self.w3.to_hex(tx_hash)
        except Exception as e:
            raise Exception(f"Erro ao registrar na blockchain: {str(e)}")

    async def record_habit_plan(self, plan: Dict):
        """
        Registra o plano de hábitos na blockchain
        """
        try:
            tx = {
                "to": self.contract_address,
                "value": 0,
                "gas": 2000000,
                "gasPrice": self.w3.to_wei("10", "gwei"),
                "nonce": self.w3.eth.get_transaction_count(
                    self.w3.eth.account.from_key(self.private_key).address
                ),
                "data": self.w3.to_hex(text=str(plan))
            }
            signed_tx = self.w3.eth.account.sign_transaction(tx, self.private_key)
            tx_hash = self.w3.eth.send_raw_transaction(signed_tx.rawTransaction)
            
            # Armazena temporariamente em memória para consulta
            temp_storage["plans"][plan["user_id"]] = plan
            
            return self.w3.to_hex(tx_hash)
        except Exception as e:
            raise Exception(f"Erro ao registrar plano na blockchain: {str(e)}")

class AIService:
    def __init__(self, allora_client):
        self.allora = allora_client

    async def generate_plan(self, anamnese_data: AnamneseData) -> List[Dict]:
        """
        Gera plano personalizado usando IA
        """
        try:
            return self.allora.predict(input_data=anamnese_data, model="habit-plan")
        except Exception as e:
            raise Exception(f"Erro ao gerar plano com IA: {str(e)}")

# Instanciação dos serviços
db_service = MockDBService()
blockchain_service = BlockchainService(w3, CONTRACT_ADDRESS, PRIVATE_KEY)
ai_service = AIService(allora)

anamnese_service = AnamneseService(ai_service, blockchain_service)
habit_service = HabitService(blockchain_service)

# Rotas da API
@app.post("/api/anamnese/{user_id}")
async def submit_anamnese(user_id: str, anamnese_data: AnamneseData):
    try:
        plan = await anamnese_service.submit_anamnese(user_id, anamnese_data)
        return {"status": "success", "plan": plan}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/habits/plan/{user_id}")
async def get_habit_plan(user_id: str):
    try:
        # Por enquanto, recupera do armazenamento temporário
        plan = temp_storage["plans"].get(user_id)
        if not plan:
            raise HTTPException(status_code=404, detail="Plano não encontrado")
        return plan
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.patch("/api/habits/{habit_id}")
async def update_habit(habit_id: str, user_id: str, completed: bool):
    try:
        await habit_service.update_habit_status(habit_id, user_id, completed)
        return {"status": "success"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/habits/progress/{user_id}")
async def get_progress(user_id: str):
    try:
        progress = await habit_service.get_progress(user_id)
        return progress
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
