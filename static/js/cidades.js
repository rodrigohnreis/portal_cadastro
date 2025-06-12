// Variáveis globais
let cidadesData = [];

// Funções de inicialização
document.addEventListener('DOMContentLoaded', () => {
    loadCidades();
    setupFormEvents();
});

// Configuração dos eventos dos formulários
function setupFormEvents() {
    document.getElementById('btn-nova-cidade').addEventListener('click', showCidadeForm);
    document.getElementById('btn-cancelar-cidade').addEventListener('click', hideCidadeForm);
    document.getElementById('cidade-form').addEventListener('submit', handleCidadeSubmit);
}

// Funções para gerenciar cidades
function loadCidades() {
    fetch('/api/cidades/')
        .then(response => response.json())
        .then(data => {
            cidadesData = data;
            renderCidadesTable();
        })
        .catch(error => {
            console.error('Erro ao carregar cidades:', error);
            showAlert('Erro ao carregar cidades. Por favor, tente novamente.', 'danger');
        });
}

function renderCidadesTable() {
    const tableBody = document.querySelector('#tabela-cidades tbody');
    tableBody.innerHTML = '';
    
    if (cidadesData.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = '<td colspan="4" class="text-center">Nenhuma cidade cadastrada</td>';
        tableBody.appendChild(row);
        return;
    }
    
    cidadesData.forEach(cidade => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${cidade.nome}</td>
            <td>${cidade.estado}</td>
            <td>${cidade.data_cadastro}</td>
            <td>
                <button class="btn btn-sm" onclick="editCidade(${cidade.id})">Editar</button>
                <button class="btn btn-sm btn-danger" onclick="deleteCidade(${cidade.id})">Excluir</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

function showCidadeForm() {
    document.getElementById('form-cidade').style.display = 'block';
    document.getElementById('cidade-id').value = '';
    document.getElementById('cidade-nome').value = '';
    document.getElementById('cidade-estado').value = '';
}

function hideCidadeForm() {
    document.getElementById('form-cidade').style.display = 'none';
}

function handleCidadeSubmit(e) {
    e.preventDefault();
    
    const cidadeId = document.getElementById('cidade-id').value;
    const nome = document.getElementById('cidade-nome').value;
    const estado = document.getElementById('cidade-estado').value;
    
    const cidadeData = {
        nome: nome,
        estado: estado
    };
    
    const url = cidadeId ? `/api/cidades/${cidadeId}` : '/api/cidades/';
    const method = cidadeId ? 'PUT' : 'POST';
    
    fetch(url, {
        method: method,
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(cidadeData)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Erro ao salvar cidade');
        }
        return response.json();
    })
    .then(data => {
        showAlert(`Cidade ${cidadeId ? 'atualizada' : 'cadastrada'} com sucesso!`, 'success');
        hideCidadeForm();
        loadCidades();
    })
    .catch(error => {
        console.error('Erro:', error);
        showAlert('Erro ao salvar cidade. Por favor, tente novamente.', 'danger');
    });
}

function editCidade(id) {
    const cidade = cidadesData.find(c => c.id === id);
    if (cidade) {
        document.getElementById('cidade-id').value = cidade.id;
        document.getElementById('cidade-nome').value = cidade.nome;
        document.getElementById('cidade-estado').value = cidade.estado;
        document.getElementById('form-cidade').style.display = 'block';
    }
}

function deleteCidade(id) {
    if (confirm('Tem certeza que deseja excluir esta cidade?')) {
        fetch(`/api/cidades/${id}`, {
            method: 'DELETE'
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Erro ao excluir cidade');
            }
            return response.json();
        })
        .then(data => {
            showAlert('Cidade excluída com sucesso!', 'success');
            loadCidades();
        })
        .catch(error => {
            console.error('Erro:', error);
            showAlert('Erro ao excluir cidade. Por favor, tente novamente.', 'danger');
        });
    }
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

