// Variáveis globais
let equipesData = [];

// Funções de inicialização
document.addEventListener('DOMContentLoaded', () => {
    loadEquipes();
    setupFormEvents();
});

// Configuração dos eventos dos formulários
function setupFormEvents() {
    document.getElementById('btn-gerar-relatorio').addEventListener('click', gerarRelatorio);
    document.getElementById('btn-download-csv').addEventListener('click', downloadCSV);
    document.getElementById('btn-download-pdf').addEventListener('click', downloadPDF);
}

// Funções para carregar dados
function loadEquipes() {
    fetch('/api/equipes/')
        .then(response => response.json())
        .then(data => {
            equipesData = data;
            populateEquipesSelect();
        })
        .catch(error => {
            console.error('Erro ao carregar equipes:', error);
        });
}

function populateEquipesSelect() {
    const select = document.getElementById('relatorio-equipe');
    select.innerHTML = '<option value="">Todas as equipes</option>';
    
    equipesData.forEach(equipe => {
        const option = document.createElement('option');
        option.value = equipe.id;
        option.textContent = equipe.nome;
        select.appendChild(option);
    });
}

function gerarRelatorio() {
    const dataInicio = document.getElementById('relatorio-data-inicio').value;
    const dataFim = document.getElementById('relatorio-data-fim').value;
    const equipeId = document.getElementById('relatorio-equipe').value;
    
    if (!dataInicio || !dataFim) {
        showAlert('Por favor, selecione as datas de início e fim.', 'warning');
        return;
    }
    
    const params = new URLSearchParams({
        data_inicio: dataInicio,
        data_fim: dataFim
    });
    
    if (equipeId) {
        params.append('equipe_id', equipeId);
    }
    
    fetch(`/api/relatorios/material-por-dia?${params}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Erro na resposta do servidor');
            }
            return response.json();
        })
        .then(data => {
            renderRelatorio(data);
            document.getElementById('btn-download-csv').disabled = false;
            document.getElementById('btn-download-pdf').disabled = false;
        })
        .catch(error => {
            console.error('Erro ao gerar relatório:', error);
            showAlert('Erro ao gerar relatório. Por favor, tente novamente.', 'danger');
        });
}

function renderRelatorio(data) {
    const container = document.getElementById('relatorio-resultado');
    
    if (data.length === 0) {
        container.innerHTML = '<p>Nenhum registro encontrado para o período selecionado.</p>';
        return;
    }
    
    let html = `
        <h4>Relatório de Material por Dia</h4>
        <table class="table">
            <thead>
                <tr>
                    <th>Data</th>
                    <th>Equipe</th>
                    <th>Material</th>
                    <th>Unidade</th>
                    <th>Quantidade Total</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    data.forEach(item => {
        html += `
            <tr>
                <td>${item.data}</td>
                <td>${item.equipe_nome}</td>
                <td>${item.material_nome}</td>
                <td>${item.unidade_medida}</td>
                <td>${item.quantidade_total}</td>
            </tr>
        `;
    });
    
    html += '</tbody></table>';
    container.innerHTML = html;
}

function downloadCSV() {
    const dataInicio = document.getElementById('relatorio-data-inicio').value;
    const dataFim = document.getElementById('relatorio-data-fim').value;
    const equipeId = document.getElementById('relatorio-equipe').value;
    
    const params = new URLSearchParams({
        data_inicio: dataInicio,
        data_fim: dataFim,
        formato: 'csv'
    });
    
    if (equipeId) {
        params.append('equipe_id', equipeId);
    }
    
    // Criar um link temporário para download
    const link = document.createElement('a');
    link.href = `/api/relatorios/material-por-dia?${params}`;
    link.download = `relatorio_material_${dataInicio}_${dataFim}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function downloadPDF() {
    const dataInicio = document.getElementById('relatorio-data-inicio').value;
    const dataFim = document.getElementById('relatorio-data-fim').value;
    const equipeId = document.getElementById('relatorio-equipe').value;
    
    const params = new URLSearchParams({
        data_inicio: dataInicio,
        data_fim: dataFim,
        formato: 'pdf'
    });
    
    if (equipeId) {
        params.append('equipe_id', equipeId);
    }
    
    // Criar um link temporário para download
    const link = document.createElement('a');
    link.href = `/api/relatorios/material-por-dia?${params}`;
    link.download = `relatorio_material_${dataInicio}_${dataFim}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Função para exibir alertas
function showAlert(message, type) {
    const alertContainer = document.getElementById('alert-container');
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.textContent = message;
    
    alertContainer.appendChild(alertDiv);
    
    // Remover o alerta após 5 segundos
    setTimeout(() => {
        alertDiv.remove();
    }, 5000);
}

