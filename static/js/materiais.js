// Variáveis globais
let materiaisData = [];

// Funções de inicialização
document.addEventListener('DOMContentLoaded', () => {
    loadMateriais();
    setupFormEvents();
});

// Configuração dos eventos dos formulários
function setupFormEvents() {
    document.getElementById('btn-novo-material').addEventListener('click', showMaterialForm);
    document.getElementById('btn-cancelar-material').addEventListener('click', hideMaterialForm);
    document.getElementById('material-form').addEventListener('submit', handleMaterialSubmit);
}

// Funções para gerenciar materiais
function loadMateriais() {
    fetch('/api/materiais/')
        .then(response => response.json())
        .then(data => {
            materiaisData = data;
            renderMateriaisTable();
        })
        .catch(error => {
            console.error('Erro ao carregar materiais:', error);
            showAlert('Erro ao carregar materiais. Por favor, tente novamente.', 'danger');
        });
}

function renderMateriaisTable() {
    const tableBody = document.querySelector('#tabela-materiais tbody');
    tableBody.innerHTML = '';
    
    if (materiaisData.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = '<td colspan="5" class="text-center">Nenhum material cadastrado</td>';
        tableBody.appendChild(row);
        return;
    }
    
    materiaisData.forEach(material => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${material.nome}</td>
            <td>${material.descricao || '-'}</td>
            <td>${material.unidade_medida}</td>
            <td>${material.data_cadastro}</td>
            <td>
                <button class="btn btn-sm" onclick="editMaterial(${material.id})">Editar</button>
                <button class="btn btn-sm btn-danger" onclick="deleteMaterial(${material.id})">Excluir</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

function showMaterialForm() {
    document.getElementById('form-material').style.display = 'block';
    document.getElementById('material-id').value = '';
    document.getElementById('material-nome').value = '';
    document.getElementById('material-descricao').value = '';
    document.getElementById('material-unidade').value = '';
}

function hideMaterialForm() {
    document.getElementById('form-material').style.display = 'none';
}

function handleMaterialSubmit(e) {
    e.preventDefault();
    
    const materialId = document.getElementById('material-id').value;
    const nome = document.getElementById('material-nome').value;
    const descricao = document.getElementById('material-descricao').value;
    const unidadeMedida = document.getElementById('material-unidade').value;
    
    const materialData = {
        nome: nome,
        descricao: descricao,
        unidade_medida: unidadeMedida
    };
    
    const url = materialId ? `/api/materiais/${materialId}` : '/api/materiais/';
    const method = materialId ? 'PUT' : 'POST';
    
    fetch(url, {
        method: method,
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(materialData)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Erro ao salvar material');
        }
        return response.json();
    })
    .then(data => {
        showAlert(`Material ${materialId ? 'atualizado' : 'cadastrado'} com sucesso!`, 'success');
        hideMaterialForm();
        loadMateriais();
    })
    .catch(error => {
        console.error('Erro:', error);
        showAlert('Erro ao salvar material. Por favor, tente novamente.', 'danger');
    });
}

function editMaterial(id) {
    const material = materiaisData.find(m => m.id === id);
    if (material) {
        document.getElementById('material-id').value = material.id;
        document.getElementById('material-nome').value = material.nome;
        document.getElementById('material-descricao').value = material.descricao || '';
        document.getElementById('material-unidade').value = material.unidade_medida;
        document.getElementById('form-material').style.display = 'block';
    }
}

function deleteMaterial(id) {
    if (confirm('Tem certeza que deseja excluir este material?')) {
        fetch(`/api/materiais/${id}`, {
            method: 'DELETE'
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Erro ao excluir material');
            }
            return response.json();
        })
        .then(data => {
            showAlert('Material excluído com sucesso!', 'success');
            loadMateriais();
        })
        .catch(error => {
            console.error('Erro:', error);
            showAlert('Erro ao excluir material. Por favor, tente novamente.', 'danger');
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

