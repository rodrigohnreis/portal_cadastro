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

