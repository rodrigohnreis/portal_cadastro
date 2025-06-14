// Funções para gerenciar o registro de múltiplos materiais

// Variável global para armazenar os materiais do registro atual
let materiaisRegistro = [
    { material_id: '', quantidade: '', observacao: '' }
];

// Função para adicionar uma nova linha de material
function adicionarMaterial() {
    materiaisRegistro.push({ material_id: '', quantidade: '', observacao: '' });
    renderizarLinhasMateriais();
}

// Função para remover uma linha de material
function removerMaterial(index) {
    if (materiaisRegistro.length > 1) {
        materiaisRegistro.splice(index, 1);
        renderizarLinhasMateriais();
    } else {
        mostrarAlerta('É necessário pelo menos um material', 'warning');
    }
}

// Função para renderizar as linhas de materiais no formulário
function renderizarLinhasMateriais() {
    const container = document.getElementById('materiais-container');
    if (!container) return;
    
    container.innerHTML = '';
    
    materiaisRegistro.forEach((item, index) => {
        const linha = document.createElement('div');
        linha.className = 'material-linha';
        
        // Select para material
        const divMaterial = document.createElement('div');
        divMaterial.className = 'form-group';
        
        const labelMaterial = document.createElement('label');
        labelMaterial.textContent = index === 0 ? 'Material' : '';
        
        const selectMaterial = document.createElement('select');
        selectMaterial.id = `material-${index}`;
        selectMaterial.className = 'material-select';
        selectMaterial.required = true;
        
        // Opção padrão
        const optionDefault = document.createElement('option');
        optionDefault.value = '';
        optionDefault.textContent = 'Selecione um material';
        selectMaterial.appendChild(optionDefault);
        
        // Carregar opções de materiais (será preenchido depois)
        carregarOpcoesSelect(selectMaterial, 'materiais');
        
        // Definir valor selecionado se existir
        if (item.material_id) {
            selectMaterial.value = item.material_id;
        }
        
        // Evento de mudança
        selectMaterial.addEventListener('change', (e) => {
            materiaisRegistro[index].material_id = e.target.value;
        });
        
        divMaterial.appendChild(labelMaterial);
        divMaterial.appendChild(selectMaterial);
        
        // Input para quantidade
        const divQuantidade = document.createElement('div');
        divQuantidade.className = 'form-group';
        
        const labelQuantidade = document.createElement('label');
        labelQuantidade.textContent = index === 0 ? 'Quantidade' : '';
        
        const inputQuantidade = document.createElement('input');
        inputQuantidade.type = 'number';
        inputQuantidade.id = `quantidade-${index}`;
        inputQuantidade.className = 'quantidade-input';
        inputQuantidade.min = '0.01';
        inputQuantidade.step = '0.01';
        inputQuantidade.required = true;
        inputQuantidade.value = item.quantidade;
        
        // Evento de mudança
        inputQuantidade.addEventListener('change', (e) => {
            materiaisRegistro[index].quantidade = e.target.value;
        });
        
        divQuantidade.appendChild(labelQuantidade);
        divQuantidade.appendChild(inputQuantidade);
        
        // Textarea para observação
        const divObservacao = document.createElement('div');
        divObservacao.className = 'form-group';
        
        const labelObservacao = document.createElement('label');
        labelObservacao.textContent = index === 0 ? 'Observação' : '';
        
        const inputObservacao = document.createElement('textarea');
        inputObservacao.id = `observacao-${index}`;
        inputObservacao.className = 'observacao-input';
        inputObservacao.rows = 2;
        inputObservacao.value = item.observacao;
        
        // Evento de mudança
        inputObservacao.addEventListener('change', (e) => {
            materiaisRegistro[index].observacao = e.target.value;
        });
        
        divObservacao.appendChild(labelObservacao);
        divObservacao.appendChild(inputObservacao);
        
        // Botão de remover
        const divBotao = document.createElement('div');
        divBotao.className = 'form-group';
        
        const labelBotao = document.createElement('label');
        labelBotao.textContent = index === 0 ? 'Ações' : '';
        
        const btnRemover = document.createElement('button');
        btnRemover.type = 'button';
        btnRemover.className = 'btn btn-danger btn-sm';
        btnRemover.textContent = 'Remover';
        btnRemover.onclick = () => removerMaterial(index);
        
        divBotao.appendChild(labelBotao);
        divBotao.appendChild(btnRemover);
        
        // Adicionar elementos à linha
        linha.appendChild(divMaterial);
        linha.appendChild(divQuantidade);
        linha.appendChild(divObservacao);
        linha.appendChild(divBotao);
        
        // Adicionar linha ao container
        container.appendChild(linha);
    });
}

// Função para enviar o formulário de registro em lote
function enviarRegistroLote() {
    const equipe_id = document.getElementById('registro-equipe').value;
    const data_registro = document.getElementById('registro-data').value;
    
    if (!equipe_id) {
        mostrarAlerta('Selecione uma equipe', 'warning');
        return;
    }
    
    if (!data_registro) {
        mostrarAlerta('Selecione uma data', 'warning');
        return;
    }
    
    // Validar materiais
    const materiais = materiaisRegistro
      .filter(m => m.material_id && m.quantidade)
      .map(m => ({
        material_id: parseInt(m.material_id),   // converte para inteiro
        quantidade: parseFloat(m.quantidade),   // converte para float
        observacao: m.observacao || ''
      }));
    
    if (materiais.length === 0) {
        mostrarAlerta('Adicione pelo menos um material com quantidade', 'warning');
        return;
    }
    
    // Preparar dados para envio
    const dados = {
        equipe_id: parseInt(equipe_id),  // converte para inteiro
        data_registro: data_registro,
        materiais: materiais
    };
    
    // Enviar para a API
    fetch('/api/registros/lote', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(dados)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Erro ao salvar registros');
        }
        return response.json();
    })
    .then(data => {
        mostrarAlerta('Registros salvos com sucesso!', 'success');
        fecharFormularioRegistro();
        carregarRegistros();
    })
    .catch(error => {
        mostrarAlerta('Erro ao salvar registros: ' + error.message, 'error');
    });
}

// Função para inicializar o formulário de registro
function inicializarFormularioRegistro() {
    // Resetar materiais
    materiaisRegistro = [{ material_id: '', quantidade: '', observacao: '' }];
    
    // Renderizar linhas iniciais
    renderizarLinhasMateriais();
    
    // Adicionar botão para adicionar material
    const btnContainer = document.getElementById('btn-adicionar-container');
    if (btnContainer) {
        btnContainer.innerHTML = '';
        
        const btnAdicionar = document.createElement('button');
        btnAdicionar.type = 'button';
        btnAdicionar.className = 'btn btn-primary';
        btnAdicionar.textContent = 'Adicionar Material';
        btnAdicionar.onclick = adicionarMaterial;
        
        btnContainer.appendChild(btnAdicionar);
    }
    
    // Configurar botão de salvar
    const btnSalvar = document.getElementById('btn-salvar-registro');
    if (btnSalvar) {
        btnSalvar.onclick = enviarRegistroLote;
    }
}

// Adicionar ao evento de abertura do formulário
document.addEventListener('DOMContentLoaded', function() {
    const btnNovoRegistro = document.getElementById('btn-novo-registro');
    if (btnNovoRegistro) {
        btnNovoRegistro.addEventListener('click', function() {
            document.getElementById('form-registro').style.display = 'block';
            inicializarFormularioRegistro();
        });
    }
    
    const btnCancelarRegistro = document.getElementById('btn-cancelar-registro');
    if (btnCancelarRegistro) {
        btnCancelarRegistro.addEventListener('click', fecharFormularioRegistro);
    }
});

// Função para fechar o formulário de registro
function fecharFormularioRegistro() {
    document.getElementById('form-registro').style.display = 'none';
    document.getElementById('registro-equipe').value = '';
    document.getElementById('registro-data').value = '';
    materiaisRegistro = [{ material_id: '', quantidade: '', observacao: '' }];
}
