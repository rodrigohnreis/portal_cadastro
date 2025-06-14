// Variáveis globais para a página inicial
let dashboardData = {
    cidades: 0,
    equipes: 0,
    materiais: 0,
    registros: 0
};

// Funções de inicialização
document.addEventListener('DOMContentLoaded', () => {
    loadDashboardStats();
});

// Função para carregar estatísticas do dashboard
function loadDashboardStats() {
    // Carregar contagem de cidades
    fetch('/api/cidades/')
        .then(response => response.json())
        .then(data => {
            document.getElementById('total-cidades').textContent = data.length;
        })
        .catch(error => {
            console.error('Erro ao carregar estatísticas de cidades:', error);
        });
    
    // Carregar contagem de equipes
    fetch('/api/equipes/')
        .then(response => response.json())
        .then(data => {
            document.getElementById('total-equipes').textContent = data.length;
        })
        .catch(error => {
            console.error('Erro ao carregar estatísticas de equipes:', error);
        });
    
    // Carregar contagem de materiais
    fetch('/api/materiais/')
        .then(response => response.json())
        .then(data => {
            document.getElementById('total-materiais').textContent = data.length;
        })
        .catch(error => {
            console.error('Erro ao carregar estatísticas de materiais:', error);
        });
    
    // Carregar contagem de registros
    fetch('/api/registros/')
        .then(response => response.json())
        .then(data => {
            document.getElementById('total-registros').textContent = data.length;
        })
        .catch(error => {
            console.error('Erro ao carregar estatísticas de registros:', error);
        });
}



// Variáveis globais para gráficos
let chartMaterialCidade = null;
let chartMaterialEquipe = null;

// Inicializar gráficos e tabelas quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
    loadDashboardStats();
    initializeCharts();
    loadChartsAndTables();
    setupDateFilters();
    loadFilterOptions();
});

// Função para inicializar os gráficos
function initializeCharts() {
    // Gráfico Material por Cidade
    const ctxCidade = document.getElementById('chart-material-cidade').getContext('2d');
    chartMaterialCidade = new Chart(ctxCidade, {
        type: 'bar',
        data: {
            labels: [],
            datasets: []
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Uso de Material por Cidade'
                },
                legend: {
                    display: true,
                    position: 'top'
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });

    // Gráfico Material por Equipe
    const ctxEquipe = document.getElementById('chart-material-equipe').getContext('2d');
    chartMaterialEquipe = new Chart(ctxEquipe, {
        type: 'bar',
        data: {
            labels: [],
            datasets: []
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Uso de Material por Equipe'
                },
                legend: {
                    display: true,
                    position: 'top'
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// Função para configurar filtros de data
function setupDateFilters() {
    const aplicarFiltros = document.getElementById('aplicar-filtros');
    const limparFiltros = document.getElementById('limpar-filtros');

    aplicarFiltros.addEventListener('click', () => {
        loadChartsAndTables();
    });

    limparFiltros.addEventListener('click', () => {
        document.getElementById('data-inicio').value = '';
        document.getElementById('data-fim').value = '';
        loadChartsAndTables();
    });
}

// Função para obter parâmetros de filtro de data
function getDateFilters() {
    const dataInicio = document.getElementById('data-inicio').value;
    const dataFim = document.getElementById('data-fim').value;
    
    let params = new URLSearchParams();
    if (dataInicio) params.append('data_inicio', dataInicio);
    if (dataFim) params.append('data_fim', dataFim);
    
    return params.toString();
}

// Função para carregar dados dos gráficos e tabelas
function loadChartsAndTables() {
    const dateParams = getDateFilters();
    
    // Carregar dados do gráfico Material por Cidade
    fetch(`/api/relatorios/material-por-cidade?${dateParams}`)
        .then(response => response.json())
        .then(data => {
            updateChartMaterialCidade(data);
        })
        .catch(error => {
            console.error('Erro ao carregar dados do gráfico Material por Cidade:', error);
        });

    // Carregar dados do gráfico Material por Equipe
    fetch(`/api/relatorios/material-por-equipe?${dateParams}`)
        .then(response => response.json())
        .then(data => {
            updateChartMaterialEquipe(data);
        })
        .catch(error => {
            console.error('Erro ao carregar dados do gráfico Material por Equipe:', error);
        });

    // Carregar dados da tabela Material x Cidade
    fetch(`/api/relatorios/tabela-material-cidade?${dateParams}`)
        .then(response => response.json())
        .then(data => {
            updateTabelaMaterialCidade(data);
        })
        .catch(error => {
            console.error('Erro ao carregar dados da tabela Material x Cidade:', error);
        });

    // Carregar dados da tabela Material x Equipe
    fetch(`/api/relatorios/tabela-material-equipe?${dateParams}`)
        .then(response => response.json())
        .then(data => {
            updateTabelaMaterialEquipe(data);
        })
        .catch(error => {
            console.error('Erro ao carregar dados da tabela Material x Equipe:', error);
        });
}

// Função para atualizar gráfico Material por Cidade
function updateChartMaterialCidade(data) {
    // Agrupar dados por cidade
    const cidadeData = {};
    const materiais = new Set();

    data.forEach(item => {
        if (!cidadeData[item.cidade]) {
            cidadeData[item.cidade] = {};
        }
        cidadeData[item.cidade][item.material] = item.quantidade;
        materiais.add(item.material);
    });

    const cidades = Object.keys(cidadeData);
    const materiaisArray = Array.from(materiais);

    // Criar datasets para cada material
    const datasets = materiaisArray.map((material, index) => {
        const colors = [
            '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
            '#FF9F40', '#FF6384', '#C9CBCF', '#4BC0C0', '#FF6384'
        ];
        
        return {
            label: material,
            data: cidades.map(cidade => cidadeData[cidade][material] || 0),
            backgroundColor: colors[index % colors.length],
            borderColor: colors[index % colors.length],
            borderWidth: 1
        };
    });

    chartMaterialCidade.data.labels = cidades;
    chartMaterialCidade.data.datasets = datasets;
    chartMaterialCidade.update();
}

// Função para atualizar gráfico Material por Equipe
function updateChartMaterialEquipe(data) {
    // Agrupar dados por equipe
    const equipeData = {};
    const materiais = new Set();

    data.forEach(item => {
        if (!equipeData[item.equipe]) {
            equipeData[item.equipe] = {};
        }
        equipeData[item.equipe][item.material] = item.quantidade;
        materiais.add(item.material);
    });

    const equipes = Object.keys(equipeData);
    const materiaisArray = Array.from(materiais);

    // Criar datasets para cada material
    const datasets = materiaisArray.map((material, index) => {
        const colors = [
            '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
            '#FF9F40', '#FF6384', '#C9CBCF', '#4BC0C0', '#FF6384'
        ];
        
        return {
            label: material,
            data: equipes.map(equipe => equipeData[equipe][material] || 0),
            backgroundColor: colors[index % colors.length],
            borderColor: colors[index % colors.length],
            borderWidth: 1
        };
    });

    chartMaterialEquipe.data.labels = equipes;
    chartMaterialEquipe.data.datasets = datasets;
    chartMaterialEquipe.update();
}

// Função para atualizar tabela Material x Cidade
function updateTabelaMaterialCidade(data) {
    const table = document.getElementById('tabela-material-cidade');
    const thead = table.querySelector('thead tr');
    const tbody = table.querySelector('tbody');

    // Limpar tabela
    thead.innerHTML = '<th>Material</th>';
    tbody.innerHTML = '';

    // Adicionar colunas das cidades
    data.cidades.forEach(cidade => {
        const th = document.createElement('th');
        th.textContent = cidade;
        thead.appendChild(th);
    });
    
    // Adicionar coluna total
    const thTotal = document.createElement('th');
    thTotal.textContent = 'Total';
    thead.appendChild(thTotal);

    // Adicionar linhas dos materiais
    data.materiais.forEach(material => {
        const tr = document.createElement('tr');
        
        // Coluna do material
        const tdMaterial = document.createElement('td');
        tdMaterial.textContent = material;
        tr.appendChild(tdMaterial);

        // Colunas das cidades
        data.cidades.forEach(cidade => {
            const td = document.createElement('td');
            td.textContent = data.tabela[material][cidade] || 0;
            tr.appendChild(td);
        });

        // Coluna total
        const tdTotal = document.createElement('td');
        tdTotal.textContent = data.tabela[material].total || 0;
        tdTotal.style.fontWeight = 'bold';
        tr.appendChild(tdTotal);

        tbody.appendChild(tr);
    });
}

// Função para atualizar tabela Material x Equipe
function updateTabelaMaterialEquipe(data) {
    const table = document.getElementById('tabela-material-equipe');
    const thead = table.querySelector('thead tr');
    const tbody = table.querySelector('tbody');

    // Limpar tabela
    thead.innerHTML = '<th>Material</th>';
    tbody.innerHTML = '';

    // Adicionar colunas das equipes
    data.equipes.forEach(equipe => {
        const th = document.createElement('th');
        th.textContent = equipe;
        thead.appendChild(th);
    });
    
    // Adicionar coluna total
    const thTotal = document.createElement('th');
    thTotal.textContent = 'Total';
    thead.appendChild(thTotal);

    // Adicionar linhas dos materiais
    data.materiais.forEach(material => {
        const tr = document.createElement('tr');
        
        // Coluna do material
        const tdMaterial = document.createElement('td');
        tdMaterial.textContent = material;
        tr.appendChild(tdMaterial);

        // Colunas das equipes
        data.equipes.forEach(equipe => {
            const td = document.createElement('td');
            td.textContent = data.tabela[material][equipe] || 0;
            tr.appendChild(td);
        });

        // Coluna total
        const tdTotal = document.createElement('td');
        tdTotal.textContent = data.tabela[material].total || 0;
        tdTotal.style.fontWeight = 'bold';
        tr.appendChild(tdTotal);

        tbody.appendChild(tr);
    });
}


// Variáveis globais para gráfico de atividade
let materialAtividadeChart = null;

// Função para carregar dados de material por atividade
function carregarMaterialPorAtividade() {
    const dataInicio = document.getElementById('data-inicio').value;
    const dataFim = document.getElementById('data-fim').value;
    
    let url = '/api/relatorios/material-por-atividade';
    const params = new URLSearchParams();
    
    if (dataInicio) params.append('data_inicio', dataInicio);
    if (dataFim) params.append('data_fim', dataFim);
    
    if (params.toString()) {
        url += '?' + params.toString();
    }
    
    fetch(url)
        .then(response => response.json())
        .then(data => {
            renderizarGraficoMaterialAtividade(data);
        })
        .catch(error => {
            console.error('Erro ao carregar dados de material por atividade:', error);
        });
}

// Função para renderizar gráfico de material por atividade
function renderizarGraficoMaterialAtividade(dados) {
    const ctx = document.getElementById('chart-material-atividade').getContext('2d');
    
    // Destruir gráfico anterior se existir
    if (materialAtividadeChart) {
        materialAtividadeChart.destroy();
    }
    
    // Agrupar dados por atividade
    const atividadeData = {};
    dados.forEach(item => {
        if (!atividadeData[item.atividade]) {
            atividadeData[item.atividade] = 0;
        }
        atividadeData[item.atividade] += item.quantidade;
    });
    
    const labels = Object.keys(atividadeData);
    const values = Object.values(atividadeData);
    
    materialAtividadeChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Quantidade Total',
                data: values,
                backgroundColor: [
                    'rgba(255, 99, 132, 0.8)',
                    'rgba(54, 162, 235, 0.8)',
                    'rgba(255, 205, 86, 0.8)',
                    'rgba(75, 192, 192, 0.8)',
                    'rgba(153, 102, 255, 0.8)',
                    'rgba(255, 159, 64, 0.8)',
                    'rgba(199, 199, 199, 0.8)',
                    'rgba(83, 102, 255, 0.8)'
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 205, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)',
                    'rgba(199, 199, 199, 1)',
                    'rgba(83, 102, 255, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Material por Atividade'
                },
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// Função para carregar tabela de material por atividade
function carregarTabelaMaterialAtividade() {
    const dataInicio = document.getElementById('data-inicio').value;
    const dataFim = document.getElementById('data-fim').value;
    
    let url = '/api/relatorios/tabela-material-atividade';
    const params = new URLSearchParams();
    
    if (dataInicio) params.append('data_inicio', dataInicio);
    if (dataFim) params.append('data_fim', dataFim);
    
    if (params.toString()) {
        url += '?' + params.toString();
    }
    
    fetch(url)
        .then(response => response.json())
        .then(data => {
            renderizarTabelaMaterialAtividade(data);
        })
        .catch(error => {
            console.error('Erro ao carregar tabela de material por atividade:', error);
        });
}

// Função para renderizar tabela de material por atividade
function renderizarTabelaMaterialAtividade(data) {
    const tabela = document.getElementById('tabela-material-atividade');
    const thead = tabela.querySelector('thead tr');
    const tbody = tabela.querySelector('tbody');
    
    // Limpar tabela
    thead.innerHTML = '<th>Material</th>';
    tbody.innerHTML = '';
    
    // Adicionar colunas das atividades
    data.atividades.forEach(atividade => {
        const th = document.createElement('th');
        th.textContent = atividade;
        thead.appendChild(th);
    });
    
    // Adicionar coluna total
    const thTotal = document.createElement('th');
    thTotal.textContent = 'Total';
    thead.appendChild(thTotal);
    
    // Adicionar linhas dos materiais
    data.materiais.forEach(material => {
        const tr = document.createElement('tr');
        
        // Coluna do material
        const tdMaterial = document.createElement('td');
        tdMaterial.textContent = material;
        tr.appendChild(tdMaterial);
        
        // Colunas das atividades
        data.atividades.forEach(atividade => {
            const td = document.createElement('td');
            const quantidade = data.tabela[material] && data.tabela[material][atividade] ? data.tabela[material][atividade] : 0;
            td.textContent = quantidade.toFixed(2);
            tr.appendChild(td);
        });
        
        // Coluna total
        const tdTotal = document.createElement('td');
        const total = data.tabela[material] ? data.tabela[material].total : 0;
        tdTotal.textContent = total.toFixed(2);
        tdTotal.style.fontWeight = 'bold';
        tr.appendChild(tdTotal);
        
        tbody.appendChild(tr);
    });
}

// Atualizar função aplicarFiltros para incluir atividade
function aplicarFiltros() {
    carregarMaterialPorCidade();
    carregarMaterialPorEquipe();
    carregarMaterialPorAtividade(); // Nova função
    carregarTabelaMaterialCidade();
    carregarTabelaMaterialEquipe();
    carregarTabelaMaterialAtividade(); // Nova função
}

// Atualizar função carregarDadosIniciais para incluir atividade
function carregarDadosIniciais() {
    carregarEstatisticas();
    carregarMaterialPorCidade();
    carregarMaterialPorEquipe();
    carregarMaterialPorAtividade(); // Nova função
    carregarTabelaMaterialCidade();
    carregarTabelaMaterialEquipe();
    carregarTabelaMaterialAtividade(); // Nova função
}



// Função para carregar opções de filtro (equipes e cidades)
async function loadFilterOptions() {
    try {
        // Carregar equipes
        const equipesResponse = await fetch('/relatorios/equipes');
        const equipes = await equipesResponse.json();
        const equipeSelect = document.getElementById('filtro-equipe');
        equipeSelect.innerHTML = '';
        equipes.forEach(equipe => {
            const option = document.createElement('option');
            option.value = equipe.id;
            option.textContent = equipe.nome;
            equipeSelect.appendChild(option);
        });

        // Carregar cidades
        const cidadesResponse = await fetch('/relatorios/cidades');
        const cidades = await cidadesResponse.json();
        const cidadeSelect = document.getElementById('filtro-cidade');
        cidadeSelect.innerHTML = '';
        cidades.forEach(cidade => {
            const option = document.createElement('option');
            option.value = cidade.id;
            option.textContent = cidade.nome;
            cidadeSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Erro ao carregar opções de filtro:', error);
    }
}

// Funções para atualizar as tabelas com base nos filtros
async function updateTabelaMaterialCidade(dataInicio, dataFim, equipeIds, cidadeIds) {
    try {
        let url = `/relatorios/tabela-material-cidade?`;
        if (dataInicio) url += `data_inicio=${dataInicio}&`;
        if (dataFim) url += `data_fim=${dataFim}&`;
        if (equipeIds && equipeIds.length > 0) url += `equipe_ids=${equipeIds.join(',')}&`;
        if (cidadeIds && cidadeIds.length > 0) url += `cidade_ids=${cidadeIds.join(',')}&`;
        url = url.slice(0, -1); // Remover o último '&' ou '?'

        const response = await fetch(url);
        const data = await response.json();

        const tabelaBody = document.querySelector('#tabela-material-cidade tbody');
        const tabelaHead = document.querySelector('#tabela-material-cidade thead tr');
        tabelaBody.innerHTML = '';
        tabelaHead.innerHTML = '<th>Material</th>';

        // Adicionar colunas de cidades
        data.cidades.forEach(cidade => {
            const th = document.createElement('th');
            th.textContent = cidade;
            tabelaHead.appendChild(th);
        });
        const thTotal = document.createElement('th');
        thTotal.textContent = 'Total';
        tabelaHead.appendChild(thTotal);

        // Preencher linhas da tabela
        data.materiais.forEach(material => {
            const row = tabelaBody.insertRow();
            const cellMaterial = row.insertCell();
            cellMaterial.textContent = material;

            data.cidades.forEach(cidade => {
                const cell = row.insertCell();
                cell.textContent = data.tabela[material][cidade] || 0;
            });
            const cellTotal = row.insertCell();
            cellTotal.textContent = data.tabela[material].total || 0;
        });
    } catch (error) {
        console.error('Erro ao carregar tabela de material por cidade:', error);
    }
}

async function updateTabelaMaterialEquipe(dataInicio, dataFim, equipeIds, cidadeIds) {
    try {
        let url = `/relatorios/tabela-material-equipe?`;
        if (dataInicio) url += `data_inicio=${dataInicio}&`;
        if (dataFim) url += `data_fim=${dataFim}&`;
        if (equipeIds && equipeIds.length > 0) url += `equipe_ids=${equipeIds.join(',')}&`;
        if (cidadeIds && cidadeIds.length > 0) url += `cidade_ids=${cidadeIds.join(',')}&`;
        url = url.slice(0, -1); // Remover o último '&' ou '?'

        const response = await fetch(url);
        const data = await response.json();

        const tabelaBody = document.querySelector('#tabela-material-equipe tbody');
        const tabelaHead = document.querySelector('#tabela-material-equipe thead tr');
        tabelaBody.innerHTML = '';
        tabelaHead.innerHTML = '<th>Material</th>';

        // Adicionar colunas de equipes
        data.equipes.forEach(equipe => {
            const th = document.createElement('th');
            th.textContent = equipe;
            tabelaHead.appendChild(th);
        });
        const thTotal = document.createElement('th');
        thTotal.textContent = 'Total';
        tabelaHead.appendChild(thTotal);

        // Preencher linhas da tabela
        data.materiais.forEach(material => {
            const row = tabelaBody.insertRow();
            const cellMaterial = row.insertCell();
            cellMaterial.textContent = material;

            data.equipes.forEach(equipe => {
                const cell = row.insertCell();
                cell.textContent = data.tabela[material][equipe] || 0;
            });
            const cellTotal = row.insertCell();
            cellTotal.textContent = data.tabela[material].total || 0;
        });
    } catch (error) {
        console.error('Erro ao carregar tabela de material por equipe:', error);
    }
}

async function updateTabelaMaterialAtividade(dataInicio, dataFim, equipeIds, cidadeIds) {
    try {
        let url = `/relatorios/tabela-material-atividade?`;
        if (dataInicio) url += `data_inicio=${dataInicio}&`;
        if (dataFim) url += `data_fim=${dataFim}&`;
        if (equipeIds && equipeIds.length > 0) url += `equipe_ids=${equipeIds.join(',')}&`;
        if (cidadeIds && cidadeIds.length > 0) url += `cidade_ids=${cidadeIds.join(',')}&`;
        url = url.slice(0, -1); // Remover o último '&' ou '?'

        const response = await fetch(url);
        const data = await response.json();

        const tabelaBody = document.querySelector('#tabela-material-atividade tbody');
        const tabelaHead = document.querySelector('#tabela-material-atividade thead tr');
        tabelaBody.innerHTML = '';
        tabelaHead.innerHTML = '<th>Material</th>';

        // Adicionar colunas de atividades
        data.atividades.forEach(atividade => {
            const th = document.createElement('th');
            th.textContent = atividade;
            tabelaHead.appendChild(th);
        });
        const thTotal = document.createElement('th');
        thTotal.textContent = 'Total';
        tabelaHead.appendChild(thTotal);

        // Preencher linhas da tabela
        data.materiais.forEach(material => {
            const row = tabelaBody.insertRow();
            const cellMaterial = row.insertCell();
            cellMaterial.textContent = material;

            data.atividades.forEach(atividade => {
                const cell = row.insertCell();
                cell.textContent = data.tabela[material][atividade] || 0;
            });
            const cellTotal = row.insertCell();
            cellTotal.textContent = data.tabela[material].total || 0;
        });
    } catch (error) {
        console.error('Erro ao carregar tabela de material por atividade:', error);
    }
}

// Atualizar a função setupDateFilters para chamar as novas funções de atualização de tabela
function setupDateFilters() {
    const dataInicioInput = document.getElementById('data-inicio');
    const dataFimInput = document.getElementById('data-fim');
    const aplicarFiltrosBtn = document.getElementById('aplicar-filtros');
    const limparFiltrosBtn = document.getElementById('limpar-filtros');
    const equipeSelect = document.getElementById('filtro-equipe');
    const cidadeSelect = document.getElementById('filtro-cidade');

    aplicarFiltrosBtn.addEventListener('click', () => {
        const dataInicio = dataInicioInput.value;
        const dataFim = dataFimInput.value;
        const selectedEquipes = Array.from(equipeSelect.selectedOptions).map(option => option.value);
        const selectedCidades = Array.from(cidadeSelect.selectedOptions).map(option => option.value);

        // Tabelas
        updateTabelaMaterialCidade(dataInicio, dataFim, selectedEquipes, selectedCidades);
        updateTabelaMaterialEquipe(dataInicio, dataFim, selectedEquipes, selectedCidades);
        updateTabelaMaterialAtividade(dataInicio, dataFim, selectedEquipes, selectedCidades);

        // Gráficos
        carregarMaterialPorCidade(dataInicio, dataFim, selectedEquipes, selectedCidades);
        carregarMaterialPorEquipe(dataInicio, dataFim, selectedEquipes, selectedCidades);
        carregarMaterialPorAtividade(dataInicio, dataFim, selectedEquipes, selectedCidades);
    });

    limparFiltrosBtn.addEventListener('click', () => {
        dataInicioInput.value = '';
        dataFimInput.value = '';
        Array.from(equipeSelect.options).forEach(option => option.selected = false);
        Array.from(cidadeSelect.options).forEach(option => option.selected = false);

        // Recarregar tudo sem filtro
        updateTabelaMaterialCidade('', '', [], []);
        updateTabelaMaterialEquipe('', '', [], []);
        updateTabelaMaterialAtividade('', '', [], []);

        carregarMaterialPorCidade('', '', [], []);
        carregarMaterialPorEquipe('', '', [], []);
        carregarMaterialPorAtividade('', '', [], []);
    });
}


// Atualizar a função loadChartsAndTables para chamar as novas funções de atualização de tabela
function loadChartsAndTables() {
    // Chamar as funções de atualização de tabela inicialmente sem filtros
    updateTabelaMaterialCidade('', '', [], []);
    updateTabelaMaterialEquipe('', '', [], []);
    updateTabelaMaterialAtividade('', '', [], []);

    // Implementar carregamento de gráficos (se necessário, adaptar para os novos filtros)
    console.log('Carregando gráficos e tabelas com filtros iniciais...');
}

