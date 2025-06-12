import os
import sys

# Configurar encoding ANTES de importar qualquer coisa
os.environ['PYTHONIOENCODING'] = 'utf-8'
os.environ['PGCLIENTENCODING'] = 'UTF8'

# DON'T CHANGE THIS !!!
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from flask import Flask, send_from_directory, request
from models.user import db
from routes.user import user_bp
from routes.cadastro.cidade import cidade_bp
from routes.cadastro.equipe import equipe_bp
from routes.cadastro.material import material_bp
from routes.cadastro.registro import registro_bp
from routes.relatorios import relatorio_bp

app = Flask(__name__, static_folder=os.path.join(os.path.dirname(__file__), 'static'))
app.config['SECRET_KEY'] = 'asdf#FGSgvasgf$5$WGT'

app.register_blueprint(user_bp, url_prefix='/api')
app.register_blueprint(cidade_bp, url_prefix='/api/cidades')
app.register_blueprint(equipe_bp, url_prefix='/api/equipes')
app.register_blueprint(material_bp, url_prefix='/api/materiais')
app.register_blueprint(registro_bp, url_prefix='/api/registros')
app.register_blueprint(relatorio_bp, url_prefix='/api/relatorios')

# Configuração do PostgreSQL com múltiplas opções de encoding
#app.config['SQLALCHEMY_DATABASE_URI'] = "postgresql://postgres:12345Ab@localhost:5432/portal_cadastro"
import os
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv("DATABASE_URL")

app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Configurações mais robustas para resolver encoding
app.config['SQLALCHEMY_ENGINE_OPTIONS'] = {
    'pool_pre_ping': True,
    'connect_args': {
        'client_encoding': 'UTF8',
        'application_name': 'portal_cadastro'
    },
    'echo': False
}

db.init_app(app)

with app.app_context():
    try:
        db.create_all()
        print("Tabelas criadas com sucesso!")
    except Exception as e:
        print(f"Erro ao criar tabelas: {e}")

# Rotas para servir as páginas HTML
@app.route('/')
def home():
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/cidades')
def cidades():
    return send_from_directory(app.static_folder, 'cidades.html')

@app.route('/equipes')
def equipes():
    return send_from_directory(app.static_folder, 'equipes.html')

@app.route('/materiais')
def materiais():
    return send_from_directory(app.static_folder, 'materiais.html')

@app.route('/registros')
def registros():
    return send_from_directory(app.static_folder, 'registros.html')

@app.route('/relatorios')
def relatorios():
    return send_from_directory(app.static_folder, 'relatorios.html')

# Rota para servir arquivos estáticos
@app.route('/<path:path>')
def serve_static(path):
    static_folder_path = app.static_folder
    if static_folder_path is None:
        return "Static folder not configured", 404

    if os.path.exists(os.path.join(static_folder_path, path)):
        return send_from_directory(static_folder_path, path)
    else:
        return "File not found", 404

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)

