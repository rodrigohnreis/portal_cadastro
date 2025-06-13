from flask import Blueprint, request, jsonify, make_response
from models.user import db
from models.cadastro.base import Cidade, Equipe, Material, RegistroMaterial
from datetime import datetime
import csv
import io
#from fpdf2 import FPDF
from fpdf import FPDF


relatorio_bp = Blueprint('relatorio', __name__)

@relatorio_bp.route('/material-por-dia', methods=['GET'])
def relatorio_material_por_dia():
    """Gera relatório de uso de materiais agrupados por dia e equipe"""
    # Parâmetros de filtro
    formato = request.args.get('formato', 'json')  # json, csv ou pdf
    equipe_id = request.args.get('equipe_id', type=int)
    data_inicio = request.args.get('data_inicio')
    data_fim = request.args.get('data_fim')
    
    # Construir consulta
    query = db.session.query(
        db.func.date(RegistroMaterial.data_registro).label('data'),
        Equipe.id.label('equipe_id'),
        Equipe.nome.label('equipe_nome'),
        Material.id.label('material_id'),
        Material.nome.label('material_nome'),
        Material.unidade_medida,
        db.func.sum(RegistroMaterial.quantidade).label('quantidade_total')
    ).join(
        Material, RegistroMaterial.material_id == Material.id
    ).join(
        Equipe, RegistroMaterial.equipe_id == Equipe.id
    )
    
    # Aplicar filtros
    if equipe_id:
        query = query.filter(RegistroMaterial.equipe_id == equipe_id)
    if data_inicio:
        try:
            data_inicio_dt = datetime.strptime(data_inicio, '%Y-%m-%d')
            query = query.filter(RegistroMaterial.data_registro >= data_inicio_dt)
        except ValueError:
            return jsonify({'erro': 'Formato de data inválido para data_inicio. Use YYYY-MM-DD.'}), 400
    if data_fim:
        try:
            data_fim_dt = datetime.strptime(data_fim, '%Y-%m-%d')
            query = query.filter(RegistroMaterial.data_registro <= data_fim_dt)
        except ValueError:
            return jsonify({'erro': 'Formato de data inválido para data_fim. Use YYYY-MM-DD.'}), 400
    
    # Agrupar resultados
    query = query.group_by(
        db.func.date(RegistroMaterial.data_registro),
        Equipe.id, Equipe.nome,
        Material.id, Material.nome, Material.unidade_medida
    ).order_by(
        db.func.date(RegistroMaterial.data_registro),
        Equipe.nome,
        Material.nome
    )
    
    # Executar consulta
    resultados = query.all()
    
    # Formatar resultados para resposta
    if formato == 'json':
        dados = []
        for r in resultados:
            dados.append({
                'data': r.data.strftime('%Y-%m-%d'),
                'equipe_id': r.equipe_id,
                'equipe_nome': r.equipe_nome,
                'material_id': r.material_id,
                'material_nome': r.material_nome,
                'unidade_medida': r.unidade_medida,
                'quantidade_total': float(r.quantidade_total)
            })
        return jsonify(dados)
    elif formato == 'csv':
        return gerar_csv_material_por_dia(resultados)
    elif formato == 'pdf':
        return gerar_pdf_material_por_dia(resultados)
    else:
        return jsonify({'erro': 'Formato não suportado. Use json, csv ou pdf.'}), 400

def gerar_csv_material_por_dia(resultados):
    """Gera relatório em formato CSV"""
    output = io.StringIO()
    writer = csv.writer(output)
    
    # Cabeçalho
    writer.writerow(['Data', 'Equipe', 'Material', 'Unidade', 'Quantidade Total'])
    
    # Dados
    for r in resultados:
        writer.writerow([
            r.data.strftime('%d/%m/%Y'),
            r.equipe_nome,
            r.material_nome,
            r.unidade_medida,
            r.quantidade_total
        ])
    
    output.seek(0)
    
    response = make_response(output.getvalue())
    response.headers['Content-Disposition'] = f'attachment; filename=material_por_dia_{datetime.now().strftime("%Y%m%d")}.csv'
    response.headers['Content-type'] = 'text/csv'
    
    return response

def gerar_pdf_material_por_dia(resultados):
    """Gera relatório em formato PDF"""
    pdf = FPDF()
    pdf.add_page()
    
    # Título
    pdf.set_font('Arial', 'B', 16)
    pdf.cell(0, 10, 'Relatório de Material por Dia', 0, 1, 'C')
    pdf.set_font('Arial', 'I', 10)
    pdf.cell(0, 10, f'Gerado em: {datetime.now().strftime("%d/%m/%Y %H:%M:%S")}', 0, 1, 'C')
    pdf.ln(5)
    
    # Agrupar por data e equipe para melhor visualização
    dados_agrupados = {}
    for r in resultados:
        data_str = r.data.strftime('%Y-%m-%d')
        chave = f"{data_str}_{r.equipe_id}"
        
        if chave not in dados_agrupados:
            dados_agrupados[chave] = {
                'data': r.data.strftime('%d/%m/%Y'),
                'equipe_nome': r.equipe_nome,
                'materiais': []
            }
        
        dados_agrupados[chave]['materiais'].append({
            'material_nome': r.material_nome,
            'unidade_medida': r.unidade_medida,
            'quantidade_total': r.quantidade_total
        })
    
    # Ordenar por data
    chaves_ordenadas = sorted(dados_agrupados.keys())
    
    # Dados
    pdf.set_font('Arial', 'B', 10)
    
    for chave in chaves_ordenadas:
        grupo = dados_agrupados[chave]
        
        # Cabeçalho do grupo
        pdf.set_fill_color(230, 230, 230)
        pdf.cell(30, 7, grupo['data'], 1, 0, 'C', True)
        pdf.cell(70, 7, grupo['equipe_nome'], 1, 1, 'L', True)
        
        # Cabeçalho da tabela de materiais
        pdf.set_font('Arial', 'B', 9)
        pdf.cell(10, 7, '', 0, 0)  # Espaço para indentação
        pdf.cell(70, 7, 'Material', 1, 0, 'C')
        pdf.cell(30, 7, 'Unidade', 1, 0, 'C')
        pdf.cell(30, 7, 'Quantidade', 1, 1, 'C')
        
        # Dados dos materiais
        pdf.set_font('Arial', '', 9)
        for material in grupo['materiais']:
            pdf.cell(10, 6, '', 0, 0)  # Espaço para indentação
            pdf.cell(70, 6, material['material_nome'], 1, 0, 'L')
            pdf.cell(30, 6, material['unidade_medida'], 1, 0, 'C')
            pdf.cell(30, 6, str(material['quantidade_total']), 1, 1, 'R')
        
        pdf.ln(5)  # Espaço entre grupos
    
    # Gerar PDF
    pdf_output = pdf.output(dest='S').encode('latin1')
    
    response = make_response(pdf_output)
    response.headers['Content-Disposition'] = f'attachment; filename=material_por_dia_{datetime.now().strftime("%Y%m%d")}.pdf'
    response.headers['Content-Type'] = 'application/pdf'
    
    return response


@relatorio_bp.route('/material-por-cidade', methods=['GET'])
def relatorio_material_por_cidade():
    """Gera dados para gráfico de material por cidade"""
    data_inicio = request.args.get('data_inicio')
    data_fim = request.args.get('data_fim')
    
    # Construir consulta
    query = db.session.query(
        Cidade.nome.label('cidade_nome'),
        Material.nome.label('material_nome'),
        db.func.sum(RegistroMaterial.quantidade).label('quantidade_total')
    ).join(
        Equipe, RegistroMaterial.equipe_id == Equipe.id
    ).join(
        Cidade, Equipe.cidade_id == Cidade.id
    ).join(
        Material, RegistroMaterial.material_id == Material.id
    )
    
    # Aplicar filtros de data
    if data_inicio:
        try:
            data_inicio_dt = datetime.strptime(data_inicio, '%Y-%m-%d')
            query = query.filter(RegistroMaterial.data_registro >= data_inicio_dt)
        except ValueError:
            return jsonify({'erro': 'Formato de data inválido para data_inicio. Use YYYY-MM-DD.'}), 400
    if data_fim:
        try:
            data_fim_dt = datetime.strptime(data_fim, '%Y-%m-%d')
            query = query.filter(RegistroMaterial.data_registro <= data_fim_dt)
        except ValueError:
            return jsonify({'erro': 'Formato de data inválido para data_fim. Use YYYY-MM-DD.'}), 400
    
    # Agrupar resultados
    query = query.group_by(Cidade.nome, Material.nome).order_by(Cidade.nome, Material.nome)
    
    resultados = query.all()
    
    # Formatar para gráfico
    dados = []
    for r in resultados:
        dados.append({
            'cidade': r.cidade_nome,
            'material': r.material_nome,
            'quantidade': float(r.quantidade_total)
        })
    
    return jsonify(dados)

@relatorio_bp.route('/material-por-equipe', methods=['GET'])
def relatorio_material_por_equipe():
    """Gera dados para gráfico de material por equipe"""
    data_inicio = request.args.get('data_inicio')
    data_fim = request.args.get('data_fim')
    
    # Construir consulta
    query = db.session.query(
        Equipe.nome.label('equipe_nome'),
        Material.nome.label('material_nome'),
        db.func.sum(RegistroMaterial.quantidade).label('quantidade_total')
    ).join(
        Equipe, RegistroMaterial.equipe_id == Equipe.id
    ).join(
        Material, RegistroMaterial.material_id == Material.id
    )
    
    # Aplicar filtros de data
    if data_inicio:
        try:
            data_inicio_dt = datetime.strptime(data_inicio, '%Y-%m-%d')
            query = query.filter(RegistroMaterial.data_registro >= data_inicio_dt)
        except ValueError:
            return jsonify({'erro': 'Formato de data inválido para data_inicio. Use YYYY-MM-DD.'}), 400
    if data_fim:
        try:
            data_fim_dt = datetime.strptime(data_fim, '%Y-%m-%d')
            query = query.filter(RegistroMaterial.data_registro <= data_fim_dt)
        except ValueError:
            return jsonify({'erro': 'Formato de data inválido para data_fim. Use YYYY-MM-DD.'}), 400
    
    # Agrupar resultados
    query = query.group_by(Equipe.nome, Material.nome).order_by(Equipe.nome, Material.nome)
    
    resultados = query.all()
    
    # Formatar para gráfico
    dados = []
    for r in resultados:
        dados.append({
            'equipe': r.equipe_nome,
            'material': r.material_nome,
            'quantidade': float(r.quantidade_total)
        })
    
    return jsonify(dados)

@relatorio_bp.route('/tabela-material-cidade', methods=['GET'])
def tabela_material_cidade():
    """Gera dados para tabela de materiais x cidades"""
    data_inicio = request.args.get('data_inicio')
    data_fim = request.args.get('data_fim')
    
    # Construir consulta
    query = db.session.query(
        Material.nome.label('material_nome'),
        Cidade.nome.label('cidade_nome'),
        db.func.sum(RegistroMaterial.quantidade).label('quantidade_total')
    ).join(
        Equipe, RegistroMaterial.equipe_id == Equipe.id
    ).join(
        Cidade, Equipe.cidade_id == Cidade.id
    ).join(
        Material, RegistroMaterial.material_id == Material.id
    )
    
    # Aplicar filtros de data
    if data_inicio:
        try:
            data_inicio_dt = datetime.strptime(data_inicio, '%Y-%m-%d')
            query = query.filter(RegistroMaterial.data_registro >= data_inicio_dt)
        except ValueError:
            return jsonify({'erro': 'Formato de data inválido para data_inicio. Use YYYY-MM-DD.'}), 400
    if data_fim:
        try:
            data_fim_dt = datetime.strptime(data_fim, '%Y-%m-%d')
            query = query.filter(RegistroMaterial.data_registro <= data_fim_dt)
        except ValueError:
            return jsonify({'erro': 'Formato de data inválido para data_fim. Use YYYY-MM-DD.'}), 400
    
    # Agrupar resultados
    query = query.group_by(Material.nome, Cidade.nome).order_by(Material.nome, Cidade.nome)
    
    resultados = query.all()
    
    # Obter lista de todas as cidades e materiais
    cidades = db.session.query(Cidade.nome).distinct().order_by(Cidade.nome).all()
    materiais = db.session.query(Material.nome).distinct().order_by(Material.nome).all()
    
    # Criar estrutura da tabela
    tabela = {}
    for material in materiais:
        tabela[material[0]] = {}
        for cidade in cidades:
            tabela[material[0]][cidade[0]] = 0
    
    # Preencher com dados reais
    for r in resultados:
        tabela[r.material_nome][r.cidade_nome] = float(r.quantidade_total)
    
    # Calcular totais por material
    for material in tabela:
        tabela[material]['total'] = sum(tabela[material].values())
    
    return jsonify({
        'tabela': tabela,
        'cidades': [c[0] for c in cidades],
        'materiais': [m[0] for m in materiais]
    })

@relatorio_bp.route('/tabela-material-equipe', methods=['GET'])
def tabela_material_equipe():
    """Gera dados para tabela de materiais x equipes"""
    data_inicio = request.args.get('data_inicio')
    data_fim = request.args.get('data_fim')
    
    # Construir consulta
    query = db.session.query(
        Material.nome.label('material_nome'),
        Equipe.nome.label('equipe_nome'),
        db.func.sum(RegistroMaterial.quantidade).label('quantidade_total')
    ).join(
        Equipe, RegistroMaterial.equipe_id == Equipe.id
    ).join(
        Material, RegistroMaterial.material_id == Material.id
    )
    
    # Aplicar filtros de data
    if data_inicio:
        try:
            data_inicio_dt = datetime.strptime(data_inicio, '%Y-%m-%d')
            query = query.filter(RegistroMaterial.data_registro >= data_inicio_dt)
        except ValueError:
            return jsonify({'erro': 'Formato de data inválido para data_inicio. Use YYYY-MM-DD.'}), 400
    if data_fim:
        try:
            data_fim_dt = datetime.strptime(data_fim, '%Y-%m-%d')
            query = query.filter(RegistroMaterial.data_registro <= data_fim_dt)
        except ValueError:
            return jsonify({'erro': 'Formato de data inválido para data_fim. Use YYYY-MM-DD.'}), 400
    
    # Agrupar resultados
    query = query.group_by(Material.nome, Equipe.nome).order_by(Material.nome, Equipe.nome)
    
    resultados = query.all()
    
    # Obter lista de todas as equipes e materiais
    equipes = db.session.query(Equipe.nome).distinct().order_by(Equipe.nome).all()
    materiais = db.session.query(Material.nome).distinct().order_by(Material.nome).all()
    
    # Criar estrutura da tabela
    tabela = {}
    for material in materiais:
        tabela[material[0]] = {}
        for equipe in equipes:
            tabela[material[0]][equipe[0]] = 0
    
    # Preencher com dados reais
    for r in resultados:
        tabela[r.material_nome][r.equipe_nome] = float(r.quantidade_total)
    
    # Calcular totais por material
    for material in tabela:
        tabela[material]['total'] = sum(tabela[material].values())
    
    return jsonify({
        'tabela': tabela,
        'equipes': [e[0] for e in equipes],
        'materiais': [m[0] for m in materiais]
    })

