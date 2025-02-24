import subprocess
import time
import uvicorn
from src.server.api import app

def main():
    # Inicia o servidor ZerePy em background
    zeropy_server = subprocess.Popen(
        ["python", "main.py", "--server", "--host", "0.0.0.0", "--port", "8000"]
    )
    
    # Aguarda um pouco para o servidor iniciar
    time.sleep(2)
    
    try:
        # Inicia a API REST
        uvicorn.run(app, host="0.0.0.0", port=3000)
    finally:
        # Garante que o servidor ZerePy seja encerrado
        zeropy_server.terminate()

if __name__ == "__main__":
    main() 