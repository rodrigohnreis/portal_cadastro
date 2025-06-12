// Variáveis globais
let equipesData = [];
let cidadesData = [];

// Funções de inicialização
document.addEventListener('DOMContentLoaded', () => {
    loadCidades();
    loadEquipes();
    setupFormEvents();
});

// Configuração dos eventos dos formulários
function setupFormEvents() {
    document.getElementById('btn-nova-equipe').addEventListener('click', showEquipeForm);
    document.getElementById('btn-cancelar-equipe').addEventListener('click', hideEquipeForm);
    document.getElementById('equipe-form').addEventListener('submit', handleEquipeSubmit);
}

// Funções para carregar dados
function loadCidades() {
    fetch('/api/cidades/')
        .then(response => response.json())
        .then(data => {
            cidadesData = data;
            populateCidadesSelect();
        })
        .catch(error => {
            console.error('Erro ao carregar cidades:', error);
        });
}

function loadEquipes() {
    fetch('/api/equipes/')
        .then(response => response.json())
        .then(data => {
            equipesData = data;
            renderEquipesTable();
        })
        .catch(error => {
            console.error('Erro ao carregar equipes:', error);
            showAlert('Erro ao carregar equipes. Por favor, tente novamente.', 'danger');
        });
}

function populateCidadesSelect() {
    const select = document.getElementById('equipe-cidade');
    select.innerHTML = '<option value="">Selecione uma cidade</option>';
    
    cidadesData.forEach(cidade => {
        const option = document.createElement('option');
        option.value = cidade.id;
        option.textContent = `${cidade.nome} - ${cidade.estado}`;
        select.appendChild(option);
    });
}

function renderEquipesTable() {
    const tableBody = document.querySelector('#tabela-equipes tbody');
    tableBody.innerHTML = '';
    
    if (equipesData.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = '<td colspan="6" class="text-center">Nenhuma equipe cadastrada</td>';
        tableBody.appendChild(row);
        return;
    }
    
    equipesData.forEach(equipe => {
        const cidade = cidadesData.find(c => c.id === equipe.cidade_id);
        const cidadeNome = cidade ? `${cidade.nome} - ${cidade.estado}` : 'Cidade não encontrada';
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${equipe.nome}</td>
            <td>${equipe.responsavel}</td>
            <td>${equipe.contato || '-'}</td>
            <td>${cidadeNome}</td>
            <td>${equipe.data_cadastro}</td>
            <td>
                <button class="btn btn-sm" onclick="editEquipe(${equipe.id})">Editar</button>
                <button class="btn btn-sm btn-danger" onclick="deleteEquipe(${equipe.id})">Excluir</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

function showEquipeForm() {
    document.getElementById('form-equipe').style.display = 'block';
    document.getElementById('equipe-id').value = '';
    document.getElementById('equipe-nome').value = '';
    document.getElementById('equipe-responsavel').value = '';
    document.getElementById('equipe-contato').value = '';
    document.getElementById('equipe-cidade').value = '';
}

function hideEquipeForm() {
    document.getElementById('form-equipe').style.display = 'none';
}

function handleEquipeSubmit(e) {
    e.preventDefault();
    
    const equipeId = document.getElementById('equipe-id').value;
    const nome = document.getElementById('equipe-nome').value;
    const responsavel = document.getElementById('equipe-responsavel').value;
    const contato = document.getElementById('equipe-contato').value;
    const cidadeId = document.getElementById('equipe-cidade').value;
    
    const equipeData = {
        nome: nome,
        responsavel: responsavel,
        contato: contato,
        cidade_id: parseInt(cidadeId)
    };
    
    const url = equipeId ? `/api/equipes/${equipeId}` : '/api/equipes/';
    const method = equipeId ? 'PUT' : 'POST';
    
    fetch(url, {
        method: method,
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(equipeData)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Erro ao salvar equipe');
        }
        return response.json();
    })
    .then(data => {
        showAlert(`Equipe ${equipeId ? 'atualizada' : 'cadastrada'} com sucesso!`, 'success');
        hideEquipeForm();
        loadEquipes();
    })
    .catch(error => {
        console.error('Erro:', error);
        showAlert('Erro ao salvar equipe. Por favor, tente novamente.', 'danger');
    });
}

function editEquipe(id) {
    const equipe = equipesData.find(e => e.id === id);
    if (equipe) {
        document.getElementById('equipe-id').value = equipe.id;
        document.getElementById('equipe-nome').value = equipe.nome;
        document.getElementById('equipe-responsavel').value = equipe.responsavel;
        document.getElementById('equipe-contato').value = equipe.contato || '';
        document.getElementById('equipe-cidade').value = equipe.cidade_id;
        document.getElementById('form-equipe').style.display = 'block';
    }
}

function deleteEquipe(id) {
    if (confirm('Tem certeza que deseja excluir esta equipe?')) {
        fetch(`/api/equipes/${id}`, {
            method: 'DELETE'
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Erro ao excluir equipe');
            }
            return response.json();
        })
        .then(data => {
            showAlert('Equipe excluída com sucesso!', 'success');
            loadEquipes();
        })
        .catch(error => {
            console.error('Erro:', error);
            showAlert('Erro ao excluir equipe. Por favor, tente novamente.', 'danger');
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

