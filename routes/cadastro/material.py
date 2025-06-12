from flask import Blueprint, request, jsonify
from models.user import db
from models.cadastro.base import Material

material_bp = Blueprint('material', __name__)

@material_bp.route('/', methods=['GET'])
def listar_materiais():
    """Lista todos os materiais cadastrados"""
    materiais = Material.query.all()
    return jsonify([material.to_dict() for material in materiais]), 200

@material_bp.route('/<int:id>', methods=['GET'])
def obter_material(id):
    """Obtém um material específico pelo ID"""
    material = Material.query.get_or_404(id)
    return jsonify(material.to_dict()), 200

@material_bp.route('/', methods=['POST'])
def criar_material():
    """Cria um novo material"""
    dados = request.json
    
    if not dados or not 'nome' in dados or not 'unidade_medida' in dados:
        return jsonify({'erro': 'Dados incompletos. Nome e unidade de medida são obrigatórios.'}), 400
    
    novo_material = Material(
        nome=dados['nome'],
        descricao=dados.get('descricao', ''),
        unidade_medida=dados['unidade_medida']
    )
    
    try:
        db.session.add(novo_material)
        db.session.commit()
        return jsonify(novo_material.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'erro': f'Erro ao cadastrar material: {str(e)}'}), 500

@material_bp.route('/<int:id>', methods=['PUT'])
def atualizar_material(id):
    """Atualiza um material existente"""
    material = Material.query.get_or_404(id)
    dados = request.json
    
    if 'nome' in dados:
        material.nome = dados['nome']
    if 'descricao' in dados:
        material.descricao = dados['descricao']
    if 'unidade_medida' in dados:
        material.unidade_medida = dados['unidade_medida']
    
    try:
        db.session.commit()
        return jsonify(material.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'erro': f'Erro ao atualizar material: {str(e)}'}), 500

@material_bp.route('/<int:id>', methods=['DELETE'])
def excluir_material(id):
    """Exclui um material"""
    material = Material.query.get_or_404(id)
    
    try:
        db.session.delete(material)
        db.session.commit()
        return jsonify({'mensagem': 'Material excluído com sucesso'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'erro': f'Erro ao excluir material: {str(e)}'}), 500
