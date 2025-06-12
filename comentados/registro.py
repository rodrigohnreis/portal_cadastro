from flask import Blueprint, request, jsonify
from models.user import db
from models.cadastro.base import RegistroMaterial, Material, Equipe
from datetime import datetime

registro_bp = Blueprint('registro', __name__)

@registro_bp.route('/', methods=['GET'])
def listar_registros():
    """Lista todos os registros de uso de materiais"""
    registros = RegistroMaterial.query.all()
    return jsonify([registro.to_dict() for registro in registros]), 200

@registro_bp.route('/<int:id>', methods=['GET'])
def obter_registro(id):
    """Obtém um registro específico pelo ID"""
    registro = RegistroMaterial.query.get_or_404(id)
    return jsonify(registro.to_dict()), 200

@registro_bp.route('/', methods=['POST'])
def criar_registro():
    """Cria um novo registro de uso de material"""
    dados = request.json
    
    if not dados or not 'material_id' in dados or not 'equipe_id' in dados or not 'quantidade' in dados:
        return jsonify({'erro': 'Dados incompletos. Material, equipe e quantidade são obrigatórios.'}), 400
    
    # Verifica se o material existe
    material = Material.query.get(dados['material_id'])
    if not material:
        return jsonify({'erro': 'Material não encontrado.'}), 404
    
    # Verifica se a equipe existe
    equipe = Equipe.query.get(dados['equipe_id'])
    if not equipe:
        return jsonify({'erro': 'Equipe não encontrada.'}), 404
    
    # Data de registro (usa a data atual se não for fornecida)
    data_registro = None
    if 'data_registro' in dados and dados['data_registro']:
        try:
            data_registro = datetime.strptime(dados['data_registro'], '%Y-%m-%d')
        except ValueError:
            return jsonify({'erro': 'Formato de data inválido. Use YYYY-MM-DD.'}), 400
    
    novo_registro = RegistroMaterial(
        material_id=dados['material_id'],
        equipe_id=dados['equipe_id'],
        quantidade=dados['quantidade'],
        observacao=dados.get('observacao', '')
    )
    
    if data_registro:
        novo_registro.data_registro = data_registro
    
    try:
        db.session.add(novo_registro)
        db.session.commit()
        return jsonify(novo_registro.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'erro': f'Erro ao cadastrar registro: {str(e)}'}), 500

@registro_bp.route('/lote', methods=['POST'])
def criar_registros_lote():
    """Cria múltiplos registros de uso de material para uma equipe em uma data"""
    dados = request.json
    
    if not dados or not 'equipe_id' in dados or not 'materiais' in dados or not isinstance(dados['materiais'], list):
        return jsonify({'erro': 'Dados incompletos. Equipe e lista de materiais são obrigatórios.'}), 400
    
    # Verifica se a equipe existe
    equipe = Equipe.query.get(dados['equipe_id'])
    if not equipe:
        return jsonify({'erro': 'Equipe não encontrada.'}), 404
    
    # Data de registro (usa a data atual se não for fornecida)
    data_registro = None
    if 'data_registro' in dados and dados['data_registro']:
        try:
            data_registro = datetime.strptime(dados['data_registro'], '%Y-%m-%d')
        except ValueError:
            return jsonify({'erro': 'Formato de data inválido. Use YYYY-MM-DD.'}), 400
    
    # Processar cada material
    registros_criados = []
    for item in dados['materiais']:
        if not 'material_id' in item or not 'quantidade' in item:
            continue
            
        # Verificar se o material existe
        material = Material.query.get(item['material_id'])
        if not material:
            continue
        
        # Criar registro
        novo_registro = RegistroMaterial(
            material_id=item['material_id'],
            equipe_id=dados['equipe_id'],
            quantidade=item['quantidade'],
            observacao=item.get('observacao', '')
        )
        
        if data_registro:
            novo_registro.data_registro = data_registro
        
        try:
            db.session.add(novo_registro)
            registros_criados.append(novo_registro)
        except Exception as e:
            continue
    
    # Commit das alterações
    if registros_criados:
        try:
            db.session.commit()
            return jsonify([r.to_dict() for r in registros_criados]), 201
        except Exception as e:
            db.session.rollback()
            return jsonify({'erro': f'Erro ao cadastrar registros: {str(e)}'}), 500
    else:
        return jsonify({'erro': 'Nenhum registro válido para cadastrar.'}), 400

@registro_bp.route('/<int:id>', methods=['PUT'])
def atualizar_registro(id):
    """Atualiza um registro existente"""
    registro = RegistroMaterial.query.get_or_404(id)
    dados = request.json
    
    if 'material_id' in dados:
        # Verifica se o material existe
        material = Material.query.get(dados['material_id'])
        if not material:
            return jsonify({'erro': 'Material não encontrado.'}), 404
        registro.material_id = dados['material_id']
        
    if 'equipe_id' in dados:
        # Verifica se a equipe existe
        equipe = Equipe.query.get(dados['equipe_id'])
        if not equipe:
            return jsonify({'erro': 'Equipe não encontrada.'}), 404
        registro.equipe_id = dados['equipe_id']
        
    if 'quantidade' in dados:
        registro.quantidade = dados['quantidade']
        
    if 'observacao' in dados:
        registro.observacao = dados['observacao']
    
    if 'data_registro' in dados and dados['data_registro']:
        try:
            registro.data_registro = datetime.strptime(dados['data_registro'], '%Y-%m-%d')
        except ValueError:
            return jsonify({'erro': 'Formato de data inválido. Use YYYY-MM-DD.'}), 400
    
    try:
        db.session.commit()
        return jsonify(registro.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'erro': f'Erro ao atualizar registro: {str(e)}'}), 500

@registro_bp.route('/<int:id>', methods=['DELETE'])
def excluir_registro(id):
    """Exclui um registro"""
    registro = RegistroMaterial.query.get_or_404(id)
    
    try:
        db.session.delete(registro)
        db.session.commit()
        return jsonify({'mensagem': 'Registro excluído com sucesso'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'erro': f'Erro ao excluir registro: {str(e)}'}), 500
