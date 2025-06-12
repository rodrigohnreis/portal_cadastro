from flask import Blueprint, request, jsonify
from models.user import db
from models.cadastro.base import Equipe, Cidade

equipe_bp = Blueprint('equipe', __name__)

@equipe_bp.route('/', methods=['GET'])
def listar_equipes():
    """Lista todas as equipes cadastradas"""
    equipes = Equipe.query.all()
    return jsonify([equipe.to_dict() for equipe in equipes]), 200

@equipe_bp.route('/<int:id>', methods=['GET'])
def obter_equipe(id):
    """Obtém uma equipe específica pelo ID"""
    equipe = Equipe.query.get_or_404(id)
    return jsonify(equipe.to_dict()), 200

@equipe_bp.route('/', methods=['POST'])
def criar_equipe():
    """Cria uma nova equipe"""
    dados = request.json
    
    if not dados or not 'nome' in dados or not 'responsavel' in dados or not 'cidade_id' in dados:
        return jsonify({'erro': 'Dados incompletos. Nome, responsável e cidade são obrigatórios.'}), 400
    
    # Verifica se a cidade existe
    cidade = Cidade.query.get(dados['cidade_id'])
    if not cidade:
        return jsonify({'erro': 'Cidade não encontrada.'}), 404
    
    nova_equipe = Equipe(
        nome=dados['nome'],
        responsavel=dados['responsavel'],
        contato=dados.get('contato', ''),
        cidade_id=dados['cidade_id']
    )
    
    try:
        db.session.add(nova_equipe)
        db.session.commit()
        return jsonify(nova_equipe.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'erro': f'Erro ao cadastrar equipe: {str(e)}'}), 500

@equipe_bp.route('/<int:id>', methods=['PUT'])
def atualizar_equipe(id):
    """Atualiza uma equipe existente"""
    equipe = Equipe.query.get_or_404(id)
    dados = request.json
    
    if 'nome' in dados:
        equipe.nome = dados['nome']
    if 'responsavel' in dados:
        equipe.responsavel = dados['responsavel']
    if 'contato' in dados:
        equipe.contato = dados['contato']
    if 'cidade_id' in dados:
        # Verifica se a cidade existe
        cidade = Cidade.query.get(dados['cidade_id'])
        if not cidade:
            return jsonify({'erro': 'Cidade não encontrada.'}), 404
        equipe.cidade_id = dados['cidade_id']
    
    try:
        db.session.commit()
        return jsonify(equipe.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'erro': f'Erro ao atualizar equipe: {str(e)}'}), 500

@equipe_bp.route('/<int:id>', methods=['DELETE'])
def excluir_equipe(id):
    """Exclui uma equipe"""
    equipe = Equipe.query.get_or_404(id)
    
    try:
        db.session.delete(equipe)
        db.session.commit()
        return jsonify({'mensagem': 'Equipe excluída com sucesso'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'erro': f'Erro ao excluir equipe: {str(e)}'}), 500
