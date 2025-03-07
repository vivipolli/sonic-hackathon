import json
import logging
from flask import Blueprint, request, jsonify
from src.connections.sonic_connection import SonicConnection
from src.config import load_config

logger = logging.getLogger("api.sonic_storage")
sonic_storage_bp = Blueprint('sonic_storage', __name__)

# Carregar a configuração do Sonic
config = load_config()
sonic_config = config.get("connections", {}).get("sonic", {})
sonic_connection = SonicConnection(sonic_config)

@sonic_storage_bp.route('/save', methods=['POST'])
def save_data():
    try:
        data = request.json
        data_type = data.get('dataType')
        content = data.get('data')
        
        if not data_type or not content:
            return jsonify({"error": "Missing dataType or data"}), 400
        
        # Converter os dados para string JSON
        data_string = json.dumps({
            "type": data_type,
            "content": content
        })
        
        # Criar um token específico para armazenar os dados
        # Isso é uma simplificação - na prática, você precisaria de um contrato inteligente
        # para armazenar dados de forma permanente
        
        # Por enquanto, vamos simular o armazenamento enviando uma transação com os dados
        # codificados no campo de dados da transação
        
        # Endereço de um contrato de armazenamento (fictício)
        storage_address = "0x1234567890123456789012345678901234567890"
        
        # Enviar transação com os dados
        tx_hash = sonic_connection.transfer(
            to_address=storage_address,
            amount=0.0001,  # Valor mínimo para a transação
            data=data_string  # Dados a serem armazenados
        )
        
        return jsonify({
            "success": True,
            "transactionHash": tx_hash
        })
        
    except Exception as e:
        logger.error(f"Error saving data to Sonic: {str(e)}")
        return jsonify({"error": str(e)}), 500

@sonic_storage_bp.route('/get', methods=['GET'])
def get_data():
    try:
        data_type = request.args.get('dataType')
        address = request.args.get('address')
        
        if not data_type or not address:
            return jsonify({"error": "Missing dataType or address"}), 400
        
        # Aqui você precisaria implementar a lógica para recuperar os dados
        # da blockchain Sonic. Isso geralmente envolve chamar um contrato inteligente
        # ou buscar transações específicas.
        
        # Esta é uma implementação fictícia
        return jsonify({
            "type": data_type,
            "content": "Dados recuperados da rede Sonic",
            "address": address
        })
        
    except Exception as e:
        logger.error(f"Error retrieving data from Sonic: {str(e)}")
        return jsonify({"error": str(e)}), 500 