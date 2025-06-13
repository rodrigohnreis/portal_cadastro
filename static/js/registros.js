// Variáveis globais
let registrosData = [];
let materiaisData = [];
let equipesData = [];
let cidadesData = [];
let materialIndex = 0; // Para controlar os IDs dos campos de material
let editingRegistroId = null; // Para controlar qual registro está sendo editado

// Funções de inicialização
document.addEventListener("DOMContentLoaded", () => {
    loadCidades();
    loadEquipes();
    loadMateriais();
    loadRegistros();
    setupFormEvents();
});

// Configuração dos eventos dos formulários
function setupFormEvents() {
    document.getElementById("btn-novo-registro").addEventListener("click", showRegistroForm);
    document.getElementById("btn-cancelar-registro").addEventListener("click", hideRegistroForm);
    document.getElementById("registro-form").addEventListener("submit", handleRegistroSubmit);
    document.getElementById("btn-add-material").addEventListener("click", addMaterialField);
}

// Funções para carregar dados
function loadCidades() {
    fetch("/api/cidades/")
        .then(response => response.json())
        .then(data => {
            cidadesData = data;
            populateCidadesSelect();
        })
        .catch(error => {
            console.error("Erro ao carregar cidades:", error);
        });
}

function loadEquipes() {
    fetch("/api/equipes/")
        .then(response => response.json())
        .then(data => {
            equipesData = data;
            populateEquipesSelect();
        })
        .catch(error => {
            console.error("Erro ao carregar equipes:", error);
        });
}

function loadMateriais() {
    fetch("/api/materiais/")
        .then(response => response.json())
        .then(data => {
            materiaisData = data;
            populateMateriaisSelect(0); // Popula o primeiro campo de material
        })
        .catch(error => {
            console.error("Erro ao carregar materiais:", error);
        });
}

function loadRegistros() {
    fetch("/api/registros/")
        .then(response => response.json())
        .then(data => {
            registrosData = data;
            renderRegistrosTable();
        })
        .catch(error => {
            console.error("Erro ao carregar registros:", error);
            showAlert("Erro ao carregar registros. Por favor, tente novamente.", "danger");
        });
}

function populateEquipesSelect() {
    const select = document.getElementById("registro-equipe");
    select.innerHTML = "<option value=\"\">Selecione uma equipe</option>";
    
    equipesData.forEach(equipe => {
        const option = document.createElement("option");
        option.value = equipe.id;
        option.textContent = equipe.nome;
        select.appendChild(option);
    });
}

function populateMateriaisSelect(index) {
    const select = document.getElementById(`registro-material-${index}`);
    select.innerHTML = "<option value=\"\">Selecione um material</option>";
    
    materiaisData.forEach(material => {
        const option = document.createElement("option");
        option.value = material.id;
        option.textContent = `${material.nome} (${material.unidade_medida})`;
        select.appendChild(option);
    });
}

function addMaterialField() {
    materialIndex++;
    const materiaisContainer = document.getElementById("materiais-container");
    const newMaterialItem = document.createElement("div");
    newMaterialItem.classList.add("material-item");
    newMaterialItem.innerHTML = `
        <div class="form-group">
            <label for="registro-material-${materialIndex}">Material</label>
            <select class="registro-material" id="registro-material-${materialIndex}" required>
                <option value="">Selecione um material</option>
            </select>
        </div>
        <div class="form-group">
            <label for="registro-quantidade-${materialIndex}">Quantidade</label>
            <input type="number" class="registro-quantidade" id="registro-quantidade-${materialIndex}" step="0.01" required>
        </div>
        <button type="button" class="btn btn-danger btn-sm btn-remove-material" data-index="${materialIndex}">Remover</button>
    `;
    materiaisContainer.appendChild(newMaterialItem);
    populateMateriaisSelect(materialIndex);

    // Adicionar evento de remoção
    newMaterialItem.querySelector(".btn-remove-material").addEventListener("click", (e) => {
        e.target.closest(".material-item").remove();
    });
}

function renderRegistrosTable() {
    const tableBody = document.querySelector("#tabela-registros tbody");
    tableBody.innerHTML = "";
    
    if (registrosData.length === 0) {
        const row = document.createElement("tr");
        row.innerHTML = "<td colspan=\"8\" class=\"text-center\">Nenhum registro cadastrado</td>";
        tableBody.appendChild(row);
        return;
    }
    
    registrosData.forEach(registro => {
        const equipe = equipesData.find(e => e.id === registro.equipe_id);
        const material = materiaisData.find(m => m.id === registro.material_id);
        const cidade = equipe ? cidadesData.find(c => c.id === equipe.cidade_id) : null;
        
        const equipeNome = equipe ? equipe.nome : "Equipe não encontrada";
        const materialNome = material ? material.nome : "Material não encontrado";
        const cidadeNome = cidade ? cidade.nome : "Cidade não encontrada";
        
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${equipeNome}</td>
            <td>${cidadeNome}</td>
            <td>${registro.atividade || "-"}</td>
            <td>${materialNome}</td>
            <td>${registro.quantidade}</td>
            <td>${registro.data_registro}</td>
            <td>${registro.observacao || "-"}</td>
            <td>
                <button class="btn btn-sm" onclick="editRegistro(${registro.id})">Editar</button>
                <button class="btn btn-sm btn-danger" onclick="deleteRegistro(${registro.id})">Excluir</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

function showRegistroForm(isEdit = false) {
    document.getElementById("form-registro").style.display = "block";
    
    if (!isEdit) {
        // Limpar campos para novo registro
        editingRegistroId = null;
        document.getElementById("registro-equipe").value = "";
        document.getElementById("registro-cidade").value = "";
        document.getElementById("registro-data").value = "";
        document.getElementById("registro-atividade").value = "";
        document.getElementById("registro-observacao").value = "";
        
        // Remover todos os campos de material, exceto o primeiro
        const materiaisContainer = document.getElementById("materiais-container");
        while (materiaisContainer.children.length > 1) {
            materiaisContainer.removeChild(materiaisContainer.lastChild);
        }
        // Resetar o primeiro campo de material
        document.getElementById("registro-material-0").value = "";
        document.getElementById("registro-quantidade-0").value = "";
        materialIndex = 0;
        
        // Reabilitar o botão de adicionar material
        document.getElementById("btn-add-material").style.display = "inline-block";
    }
}

function hideRegistroForm() {
    document.getElementById("form-registro").style.display = "none";
    editingRegistroId = null;
}

function handleRegistroSubmit(e) {
    e.preventDefault();
    
    const equipeId = document.getElementById("registro-equipe").value;
    const cidadeId = document.getElementById("registro-cidade").value;
    const data = document.getElementById("registro-data").value;
    const atividade = document.getElementById("registro-atividade").value;
    const observacao = document.getElementById("registro-observacao").value;
    
    if (editingRegistroId) {
        // Modo de edição - editar apenas um registro
        const materialId = document.getElementById("registro-material-0").value;
        const quantidade = document.getElementById("registro-quantidade-0").value;
        
        if (!materialId || !quantidade || !atividade || !cidadeId) {
            showAlert("Por favor, preencha todos os campos obrigatórios (material, quantidade, atividade e cidade).", "danger");
            return;
        }
        
        const registroData = {
            equipe_id: parseInt(equipeId),
            cidade_id: parseInt(cidadeId),
            material_id: parseInt(materialId),
            quantidade: parseFloat(quantidade),
            atividade: atividade,
            data_registro: data,
            observacao: observacao
        };
        
        fetch(`/api/registros/${editingRegistroId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(registroData)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error("Erro ao atualizar registro");
            }
            return response.json();
        })
        .then(data => {
            showAlert("Registro atualizado com sucesso!", "success");
            hideRegistroForm();
            loadRegistros();
        })
        .catch(error => {
            console.error("Erro:", error);
            showAlert("Erro ao atualizar registro. Por favor, tente novamente.", "danger");
        });
    } else {
        // Modo de criação - criar múltiplos registros
        const materiais = [];
        document.querySelectorAll(".material-item").forEach(item => {
            const materialSelect = item.querySelector(".registro-material");
            const quantidadeInput = item.querySelector(".registro-quantidade");
            
            if (materialSelect.value && quantidadeInput.value) {
                materiais.push({
                    material_id: parseInt(materialSelect.value),
                    quantidade: parseFloat(quantidadeInput.value),
                    atividade: atividade
                });
            }
        });

        if (materiais.length === 0) {
            showAlert("Por favor, adicione pelo menos um material e quantidade.", "danger");
            return;
        }
        
        const registroData = {
            equipe_id: parseInt(equipeId),
            cidade_id: parseInt(cidadeId),
            data_registro: data,
            observacao: observacao,
            materiais: materiais
        };
        
        fetch("/api/registros/lote", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(registroData)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error("Erro ao salvar registro");
            }
            return response.json();
        })
        .then(data => {
            showAlert("Registros cadastrados com sucesso!", "success");
            hideRegistroForm();
            loadRegistros();
        })
        .catch(error => {
            console.error("Erro:", error);
            showAlert("Erro ao salvar registro. Por favor, tente novamente.", "danger");
        });
    }
}

// Funções de edição e exclusão
function editRegistro(id) {
    const registro = registrosData.find(r => r.id === id);
    if (registro) {
        editingRegistroId = id;
        showRegistroForm(true);
        
        // Preencher o formulário com os dados do registro
        document.getElementById("registro-equipe").value = registro.equipe_id;
        document.getElementById("registro-cidade").value = registro.cidade_id || "";
        document.getElementById("registro-data").value = registro.data_registro.split(' ')[0]; // Pegar apenas a data
        document.getElementById("registro-atividade").value = registro.atividade || "";
        document.getElementById("registro-observacao").value = registro.observacao || "";
        
        // Limpar campos de material extras e preencher apenas o primeiro
        const materiaisContainer = document.getElementById("materiais-container");
        while (materiaisContainer.children.length > 1) {
            materiaisContainer.removeChild(materiaisContainer.lastChild);
        }
        
        document.getElementById("registro-material-0").value = registro.material_id;
        document.getElementById("registro-quantidade-0").value = registro.quantidade;
        materialIndex = 0;
        
        // Desabilitar o botão de adicionar material durante a edição
        document.getElementById("btn-add-material").style.display = "none";
    }
}

function deleteRegistro(id) {
    if (confirm("Tem certeza que deseja excluir este registro?")) {
        fetch(`/api/registros/${id}`, {
            method: "DELETE"
        })
        .then(response => {
            if (!response.ok) {
                throw new Error("Erro ao excluir registro");
            }
            return response.json();
        })
        .then(data => {
            showAlert("Registro excluído com sucesso!", "success");
            loadRegistros();
        })
        .catch(error => {
            console.error("Erro:", error);
            showAlert("Erro ao excluir registro. Por favor, tente novamente.", "danger");
        });
    }
}

// Função para exibir alertas (mantida)
function showAlert(message, type) {
    const alertContainer = document.getElementById("alert-container");
    const alertDiv = document.createElement("div");
    alertDiv.className = `alert alert-${type}`;
    alertDiv.textContent = message;
    
    alertContainer.appendChild(alertDiv);
    
    // Remover o alerta após 5 segundos
    setTimeout(() => {
        alertDiv.remove();
    }, 5000);
}


function populateCidadesSelect() {
    const select = document.getElementById("registro-cidade");
    select.innerHTML = "<option value=\"\">Selecione uma cidade</option>";
    
    cidadesData.forEach(cidade => {
        const option = document.createElement("option");
        option.value = cidade.id;
        option.textContent = `${cidade.nome} - ${cidade.estado}`;
        select.appendChild(option);
    });
}

