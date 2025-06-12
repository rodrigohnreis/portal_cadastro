// Funções para gerenciar relatórios

// Função para inicializar a interface de relatórios
function inicializarRelatorios() {
    // Adicionar evento ao botão de gerar relatório
    const btnGerarRelatorio = document.getElementById('btn-gerar-relatorio');
    if (btnGerarRelatorio) {
        btnGerarRelatorio.addEventListener('click', gerarRelatorioMaterialPorDia);
    }
    
    // Adicionar eventos aos botões de download
    const btnDownloadCSV = document.getElementById('btn-download-csv');
    if (btnDownloadCSV) {
        btnDownloadCSV.addEventListener('click', () => downloadRelatorio('csv'));
    }
    
    const btnDownloadPDF = document.getElementById('btn-download-pdf');
    if (btnDownloadPDF) {
        btnDownloadPDF.addEventListener('click', () => downloadRelatorio('pdf'));
    }
    
    // Carregar opções para o select de equipes
    const selectEquipe = document.getElementById('relatorio-equipe');
    if (selectEquipe) {
        carregarOpcoesSelect(selectEquipe, 'equipes');
    }
}

// Função para gerar relatório de material por dia
function gerarRelatorioMaterialPorDia() {
    const dataInicio = document.getElementById('relatorio-data-inicio').value;
    const dataFim = document.getElementById('relatorio-data-fim').value;
    const equipeId = document.getElementById('relatorio-equipe').value;
    
    // Validar datas
    if (!dataInicio || !dataFim) {
        mostrarAlerta('Selecione o período para o relatório', 'warning');
        return;
    }
    
    // Construir URL com parâmetros
    let url = '/api/relatorios/material-por-dia?';
    if (dataInicio) url += `data_inicio=${dataInicio}&`;
    if (dataFim) url += `data_fim=${dataFim}&`;
    if (equipeId) url += `equipe_id=${equipeId}&`;
    
    // Remover último &
    url = url.endsWith('&') ? url.slice(0, -1) : url;
    
    // Mostrar indicador de carregamento
    const resultadoContainer = document.getElementById('relatorio-resultado');
    if (resultadoContainer) {
        resultadoContainer.innerHTML = '<div class="loading">Carregando relatório...</div>';
    }
    
    // Fazer requisição
    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Erro ao carregar relatório');
            }
            return response.json();
        })
        .then(data => {
            renderizarRelatorioMaterialPorDia(data);
            
            // Habilitar botões de download
            document.getElementById('btn-download-csv').disabled = false;
            document.getElementById('btn-download-pdf').disabled = false;
        })
        .catch(error => {
            mostrarAlerta('Erro ao carregar relatório: ' + error.message, 'error');
            if (resultadoContainer) {
                resultadoContainer.innerHTML = '<div class="error">Erro ao carregar relatório</div>';
            }
        });
}

// Função para renderizar o relatório de material por dia
function renderizarRelatorioMaterialPorDia(dados) {
    const resultadoContainer = document.getElementById('relatorio-resultado');
    if (!resultadoContainer) return;
    
    // Se não houver dados
    if (!dados || dados.length === 0) {
        resultadoContainer.innerHTML = '<div class="info">Nenhum registro encontrado para o período selecionado</div>';
        return;
    }
    
    // Agrupar dados por data e equipe
    const dadosAgrupados = {};
    dados.forEach(item => {
        const chave = `${item.data}_${item.equipe_id}`;
        
        if (!dadosAgrupados[chave]) {
            dadosAgrupados[chave] = {
                data: item.data,
                data_formatada: formatarData(item.data),
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
    
    // Ordenar chaves por data
    const chavesOrdenadas = Object.keys(dadosAgrupados).sort();
    
    // Criar HTML do relatório
    let html = `
        <h3>Relatório de Material por Dia</h3>
        <p>Período: ${formatarData(dados[0].data)} a ${formatarData(dados[dados.length - 1].data)}</p>
    `;
    
    // Criar tabela para cada grupo (data + equipe)
    chavesOrdenadas.forEach(chave => {
        const grupo = dadosAgrupados[chave];
        
        html += `
            <div class="relatorio-grupo">
                <div class="relatorio-grupo-header">
                    <div class="data">${grupo.data_formatada}</div>
                    <div class="equipe">${grupo.equipe_nome}</div>
                </div>
                <table class="table">
                    <thead>
                        <tr>
                            <th>Material</th>
                            <th>Unidade</th>
                            <th>Quantidade</th>
                        </tr>
                    </thead>
                    <tbody>
        `;
        
        // Adicionar linhas para cada material
        grupo.materiais.forEach(material => {
            html += `
                <tr>
                    <td>${material.material_nome}</td>
                    <td>${material.unidade_medida}</td>
                    <td class="quantidade">${material.quantidade_total}</td>
                </tr>
            `;
        });
        
        // Calcular total para materiais com mesma unidade
        const totaisPorUnidade = {};
        grupo.materiais.forEach(material => {
            if (!totaisPorUnidade[material.unidade_medida]) {
                totaisPorUnidade[material.unidade_medida] = 0;
            }
            totaisPorUnidade[material.unidade_medida] += material.quantidade_total;
        });
        
        // Adicionar linha de total para cada unidade
        Object.keys(totaisPorUnidade).forEach(unidade => {
            html += `
                <tr class="total">
                    <td colspan="2">Total (${unidade})</td>
                    <td class="quantidade">${totaisPorUnidade[unidade]}</td>
                </tr>
            `;
        });
        
        html += `
                    </tbody>
                </table>
            </div>
        `;
    });
    
    resultadoContainer.innerHTML = html;
}

// Função para download de relatório
function downloadRelatorio(formato) {
    const dataInicio = document.getElementById('relatorio-data-inicio').value;
    const dataFim = document.getElementById('relatorio-data-fim').value;
    const equipeId = document.getElementById('relatorio-equipe').value;
    
    // Validar datas
    if (!dataInicio || !dataFim) {
        mostrarAlerta('Selecione o período para o relatório', 'warning');
        return;
    }
    
    // Construir URL com parâmetros
    let url = `/api/relatorios/material-por-dia?formato=${formato}`;
    if (dataInicio) url += `&data_inicio=${dataInicio}`;
    if (dataFim) url += `&data_fim=${dataFim}`;
    if (equipeId) url += `&equipe_id=${equipeId}`;
    
    // Abrir em nova aba para download
    window.open(url, '_blank');
}

// Função auxiliar para formatar data
function formatarData(dataStr) {
    if (!dataStr) return '';
    
    try {
        const partes = dataStr.split('-');
        return `${partes[2]}/${partes[1]}/${partes[0]}`;
    } catch (e) {
        return dataStr;
    }
}

// Adicionar ao evento DOMContentLoaded
document.addEventListener('DOMContentLoaded', function() {
    // Inicializar relatórios se estiver na página de relatórios
    if (document.getElementById('relatorios')) {
        inicializarRelatorios();
    }
});
