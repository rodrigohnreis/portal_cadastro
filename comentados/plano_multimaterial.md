# Plano de Implementação: Registro Multimaterial e Relatório por Dia

## 1. Análise do Modelo Atual

O modelo atual já suporta o registro de múltiplos materiais por equipe, pois cada registro é uma entrada independente na tabela `registros_materiais`. Não é necessário alterar a estrutura do banco de dados, apenas a forma como os registros são criados e exibidos.

### Modelo Atual
- `RegistroMaterial`: Contém material_id, equipe_id, quantidade, data_registro e observacao
- Cada registro representa o uso de um material por uma equipe em uma data específica

## 2. Estratégia de Implementação

### 2.1 Backend (API)

1. **Modificar a API de Registro**:
   - Criar um novo endpoint para registrar múltiplos materiais de uma vez
   - Formato: `/api/registros/lote` (POST)
   - Recebe: `{ equipe_id, data_registro, materiais: [{ material_id, quantidade, observacao }, ...] }`
   - Mantém o endpoint atual para compatibilidade

2. **Implementar API de Relatório**:
   - Criar endpoint para relatório por dia: `/api/relatorios/material-por-dia`
   - Parâmetros: data_inicio, data_fim, equipe_id (opcional)
   - Retorna: Soma de materiais agrupados por dia e equipe

### 2.2 Frontend

1. **Formulário de Registro Dinâmico**:
   - Manter campos de equipe e data
   - Adicionar seção para múltiplos materiais com botão "Adicionar Material"
   - Cada linha de material terá: seleção de material, quantidade e observação
   - Botão para remover linha de material

2. **Interface de Relatório**:
   - Adicionar seção "Relatórios" no menu principal
   - Criar formulário para filtrar por período e equipe (opcional)
   - Exibir tabela com resultados agrupados por dia e equipe
   - Adicionar opção para download em CSV/PDF

## 3. Detalhes de Implementação

### 3.1 Modificações no Backend

1. **Novo Endpoint para Registro em Lote**:
   ```python
   @registro_bp.route('/lote', methods=['POST'])
   def criar_registros_lote():
       dados = request.json
       
       if not dados or not 'equipe_id' in dados or not 'materiais' in dados:
           return jsonify({'erro': 'Dados incompletos'}), 400
       
       # Verificar se a equipe existe
       equipe = Equipe.query.get(dados['equipe_id'])
       if not equipe:
           return jsonify({'erro': 'Equipe não encontrada'}), 404
       
       # Data de registro (usa a data atual se não for fornecida)
       data_registro = dados.get('data_registro', datetime.utcnow().strftime('%Y-%m-%d'))
       
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
               data_registro=datetime.strptime(data_registro, '%Y-%m-%d'),
               observacao=item.get('observacao', '')
           )
           
           try:
               db.session.add(novo_registro)
               registros_criados.append(novo_registro)
           except Exception as e:
               continue
       
       # Commit das alterações
       try:
           db.session.commit()
           return jsonify([r.to_dict() for r in registros_criados]), 201
       except Exception as e:
           db.session.rollback()
           return jsonify({'erro': f'Erro ao cadastrar registros: {str(e)}'}), 500
   ```

2. **API de Relatório por Dia**:
   ```python
   @relatorio_bp.route('/material-por-dia', methods=['GET'])
   def relatorio_material_por_dia():
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
           query = query.filter(RegistroMaterial.data_registro >= data_inicio)
       if data_fim:
           query = query.filter(RegistroMaterial.data_registro <= data_fim)
       
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
   ```

### 3.2 Modificações no Frontend

1. **Formulário de Registro Dinâmico**:
   ```javascript
   // Estado para armazenar múltiplos materiais
   let materiaisRegistro = [
       { material_id: '', quantidade: '', observacao: '' }
   ];
   
   // Função para adicionar linha de material
   function adicionarMaterial() {
       materiaisRegistro.push({ material_id: '', quantidade: '', observacao: '' });
       renderizarLinhasMateriais();
   }
   
   // Função para remover linha de material
   function removerMaterial(index) {
       if (materiaisRegistro.length > 1) {
           materiaisRegistro.splice(index, 1);
           renderizarLinhasMateriais();
       }
   }
   
   // Função para renderizar linhas de materiais
   function renderizarLinhasMateriais() {
       const container = document.getElementById('materiais-container');
       container.innerHTML = '';
       
       materiaisRegistro.forEach((item, index) => {
           const linha = document.createElement('div');
           linha.className = 'material-linha';
           
           // Seleção de material
           const selectMaterial = document.createElement('select');
           selectMaterial.id = `material-${index}`;
           selectMaterial.required = true;
           // Preencher opções de materiais
           
           // Campo de quantidade
           const inputQuantidade = document.createElement('input');
           inputQuantidade.type = 'number';
           inputQuantidade.id = `quantidade-${index}`;
           inputQuantidade.min = '0.01';
           inputQuantidade.step = '0.01';
           inputQuantidade.required = true;
           
           // Campo de observação
           const inputObservacao = document.createElement('textarea');
           inputObservacao.id = `observacao-${index}`;
           
           // Botão de remover
           const btnRemover = document.createElement('button');
           btnRemover.textContent = 'Remover';
           btnRemover.type = 'button';
           btnRemover.onclick = () => removerMaterial(index);
           
           // Adicionar elementos à linha
           linha.appendChild(selectMaterial);
           linha.appendChild(inputQuantidade);
           linha.appendChild(inputObservacao);
           linha.appendChild(btnRemover);
           
           // Adicionar linha ao container
           container.appendChild(linha);
       });
   }
   
   // Função para enviar formulário
   function enviarRegistro() {
       const equipe_id = document.getElementById('registro-equipe').value;
       const data_registro = document.getElementById('registro-data').value;
       
       // Coletar dados dos materiais
       const materiais = materiaisRegistro.map((_, index) => {
           return {
               material_id: document.getElementById(`material-${index}`).value,
               quantidade: document.getElementById(`quantidade-${index}`).value,
               observacao: document.getElementById(`observacao-${index}`).value
           };
       }).filter(m => m.material_id && m.quantidade);
       
       // Enviar para a API
       fetch('/api/registros/lote', {
           method: 'POST',
           headers: {
               'Content-Type': 'application/json'
           },
           body: JSON.stringify({
               equipe_id,
               data_registro,
               materiais
           })
       })
       .then(response => response.json())
       .then(data => {
           // Tratar resposta
           mostrarAlerta('Registros salvos com sucesso!', 'success');
           fecharFormulario();
           carregarRegistros();
       })
       .catch(error => {
           mostrarAlerta('Erro ao salvar registros', 'error');
       });
   }
   ```

2. **Interface de Relatório**:
   ```javascript
   // Função para carregar relatório
   function carregarRelatorio() {
       const data_inicio = document.getElementById('relatorio-data-inicio').value;
       const data_fim = document.getElementById('relatorio-data-fim').value;
       const equipe_id = document.getElementById('relatorio-equipe').value;
       
       // Construir URL com parâmetros
       let url = `/api/relatorios/material-por-dia?`;
       if (data_inicio) url += `data_inicio=${data_inicio}&`;
       if (data_fim) url += `data_fim=${data_fim}&`;
       if (equipe_id) url += `equipe_id=${equipe_id}&`;
       
       // Remover último &
       url = url.endsWith('&') ? url.slice(0, -1) : url;
       
       // Fazer requisição
       fetch(url)
           .then(response => response.json())
           .then(data => {
               renderizarTabelaRelatorio(data);
           })
           .catch(error => {
               mostrarAlerta('Erro ao carregar relatório', 'error');
           });
   }
   
   // Função para renderizar tabela de relatório
   function renderizarTabelaRelatorio(dados) {
       const container = document.getElementById('relatorio-resultado');
       
       // Agrupar por data e equipe
       const dadosAgrupados = {};
       dados.forEach(item => {
           const chave = `${item.data}_${item.equipe_id}`;
           if (!dadosAgrupados[chave]) {
               dadosAgrupados[chave] = {
                   data: item.data,
                   equipe_id: item.equipe_id,
                   equipe_nome: item.equipe_nome,
                   materiais: []
               };
           }
           
           dadosAgrupados[chave].materiais.push({
               material_id: item.material_id,
               material_nome: item.material_nome,
               unidade_medida: item.unidade_medida,
               quantidade_total: item.quantidade_total
           });
       });
       
       // Criar tabela
       let html = `
           <table class="table">
               <thead>
                   <tr>
                       <th>Data</th>
                       <th>Equipe</th>
                       <th>Materiais</th>
                   </tr>
               </thead>
               <tbody>
       `;
       
       // Adicionar linhas
       Object.values(dadosAgrupados).forEach(grupo => {
           html += `
               <tr>
                   <td>${formatarData(grupo.data)}</td>
                   <td>${grupo.equipe_nome}</td>
                   <td>
                       <ul>
           `;
           
           grupo.materiais.forEach(material => {
               html += `
                   <li>${material.material_nome}: ${material.quantidade_total} ${material.unidade_medida}</li>
               `;
           });
           
           html += `
                       </ul>
                   </td>
               </tr>
           `;
       });
       
       html += `
               </tbody>
           </table>
       `;
       
       container.innerHTML = html;
   }
   
   // Função para download de relatório
   function downloadRelatorio(formato) {
       const data_inicio = document.getElementById('relatorio-data-inicio').value;
       const data_fim = document.getElementById('relatorio-data-fim').value;
       const equipe_id = document.getElementById('relatorio-equipe').value;
       
       // Construir URL com parâmetros
       let url = `/api/relatorios/material-por-dia?formato=${formato}`;
       if (data_inicio) url += `&data_inicio=${data_inicio}`;
       if (data_fim) url += `&data_fim=${data_fim}`;
       if (equipe_id) url += `&equipe_id=${equipe_id}`;
       
       // Abrir em nova aba para download
       window.open(url, '_blank');
   }
   ```

## 4. Plano de Implementação

1. **Criar Blueprint de Relatórios**:
   - Implementar `/routes/relatorios.py`
   - Registrar blueprint no `main.py`

2. **Atualizar API de Registro**:
   - Adicionar endpoint para registro em lote

3. **Atualizar Frontend**:
   - Modificar formulário de registro para suportar múltiplos materiais
   - Adicionar seção de relatórios no menu
   - Implementar interface de relatório por dia

4. **Testar Funcionalidades**:
   - Testar registro de múltiplos materiais
   - Testar geração de relatório por dia
   - Testar download de relatório em diferentes formatos

5. **Documentar Alterações**:
   - Atualizar manual do usuário
   - Preparar instruções de uso das novas funcionalidades
