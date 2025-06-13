from models.user import db
from datetime import datetime

class Cidade(db.Model):
    __tablename__ = 'cidades'
    
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(100), nullable=False)
    estado = db.Column(db.String(2), nullable=False)
    data_cadastro = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relacionamentos
    equipes = db.relationship('Equipe', backref='cidade', lazy=True)
    
    def __repr__(self):
        return f'<Cidade {self.nome}-{self.estado}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'nome': self.nome,
            'estado': self.estado,
            'data_cadastro': self.data_cadastro.strftime('%d/%m/%Y %H:%M:%S')
        }

class Equipe(db.Model):
    __tablename__ = 'equipes'
    
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(100), nullable=False)
    responsavel = db.Column(db.String(100), nullable=False)
    contato = db.Column(db.String(20))
    cidade_id = db.Column(db.Integer, db.ForeignKey('cidades.id'), nullable=False)
    data_cadastro = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relacionamentos
    registros = db.relationship('RegistroMaterial', backref='equipe', lazy=True)
    
    def __repr__(self):
        return f'<Equipe {self.nome}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'nome': self.nome,
            'responsavel': self.responsavel,
            'contato': self.contato,
            'cidade_id': self.cidade_id,
            'data_cadastro': self.data_cadastro.strftime('%d/%m/%Y %H:%M:%S')
        }

class Material(db.Model):
    __tablename__ = 'materiais'
    
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(100), nullable=False)
    descricao = db.Column(db.Text)
    unidade_medida = db.Column(db.String(20), nullable=False)
    data_cadastro = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relacionamentos
    registros = db.relationship('RegistroMaterial', backref='material', lazy=True)
    
    def __repr__(self):
        return f'<Material {self.nome}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'nome': self.nome,
            'descricao': self.descricao,
            'unidade_medida': self.unidade_medida,
            'data_cadastro': self.data_cadastro.strftime('%d/%m/%Y %H:%M:%S')
        }

class RegistroMaterial(db.Model):
    __tablename__ = 'registros_materiais'
    
    id = db.Column(db.Integer, primary_key=True)
    material_id = db.Column(db.Integer, db.ForeignKey('materiais.id'), nullable=False)
    equipe_id = db.Column(db.Integer, db.ForeignKey('equipes.id'), nullable=False)
    quantidade = db.Column(db.Float, nullable=False)
    atividade = db.Column(db.String(100), nullable=False)
    data_registro = db.Column(db.DateTime, default=datetime.utcnow)
    observacao = db.Column(db.Text)
    
    def __repr__(self):
        return f'<RegistroMaterial {self.id}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'material_id': self.material_id,
            'equipe_id': self.equipe_id,
            'quantidade': self.quantidade,
            'atividade': self.atividade,
            'data_registro': self.data_registro.strftime('%d/%m/%Y %H:%M:%S'),
            'observacao': self.observacao
        }
