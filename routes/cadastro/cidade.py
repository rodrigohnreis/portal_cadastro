from flask import Blueprint, request, jsonify
from models.user import db
from models.cadastro.base import Cidade

cidade_bp = Blueprint('cidade', __name__)

@cidade_bp.route('/', methods=['GET'])
def listar_cidades():
    """Lista todas as cidades cadastradas"""
    cidades = Cidade.query.all()
    return jsonify([cidade.to_dict() for cidade in cidades]), 200

@cidade_bp.route('/<int:id>', methods=['GET'])
def obter_cidade(id):
    """Obtém uma cidade específica pelo ID"""
    cidade = Cidade.query.get_or_404(id)
    return jsonify(cidade.to_dict()), 200

@cidade_bp.route('/', methods=['POST'])
def criar_cidade():
    """Cria uma nova cidade"""
    dados = request.json
    
    if not dados or not 'nome' in dados or not 'estado' in dados:
        return jsonify({'erro': 'Dados incompletos. Nome e estado são obrigatórios.'}), 400
    
    nova_cidade = Cidade(
        nome=dados['nome'],
        estado=dados['estado']
    )
    
    try:
        db.session.add(nova_cidade)
        db.session.commit()
        return jsonify(nova_cidade.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'erro': f'Erro ao cadastrar cidade: {str(e)}'}), 500

@cidade_bp.route('/<int:id>', methods=['PUT'])
def atualizar_cidade(id):
    """Atualiza uma cidade existente"""
    cidade = Cidade.query.get_or_404(id)
    dados = request.json
    
    if 'nome' in dados:
        cidade.nome = dados['nome']
    if 'estado' in dados:
        cidade.estado = dados['estado']
    
    try:
        db.session.commit()
        return jsonify(cidade.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'erro': f'Erro ao atualizar cidade: {str(e)}'}), 500

@cidade_bp.route('/<int:id>', methods=['DELETE'])
def excluir_cidade(id):
    """Exclui uma cidade"""
    cidade = Cidade.query.get_or_404(id)
    
    try:
        db.session.delete(cidade)
        db.session.commit()
        return jsonify({'mensagem': 'Cidade excluída com sucesso'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'erro': f'Erro ao excluir cidade: {str(e)}'}), 500
