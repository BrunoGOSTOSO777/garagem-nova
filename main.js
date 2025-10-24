// ========================================================================
// --- CONFIGURAÇÃO DA API ---
// ========================================================================
const backendBaseUrl = 'http://localhost:3001';

// ========================================================================
// --- SELETORES DE ELEMENTOS DO DOM ---
// ========================================================================
const listaContainer = document.getElementById('lista-frota-db');
// CORREÇÃO: O ID do formulário do DB foi corrigido aqui
const addVehicleDbForm = document.getElementById('add-vehicle-db-form');
const editModal = document.getElementById('edit-modal');
const editVehicleForm = document.getElementById('edit-vehicle-form');
const closeModalBtn = document.getElementById('close-modal-btn');
const legacyAddForm = document.getElementById('add-vehicle-form'); // Formulário da garagem visual
const climaBtn = document.getElementById('verificar-clima-btn');

// ========================================================================
// --- LÓGICA DO CRUD DE VEÍCULOS (MongoDB) ---
// ========================================================================

async function buscarEExibirVeiculos() {
    if (!listaContainer) return;
    listaContainer.innerHTML = '<li>Carregando frota...</li>';
    try {
        const response = await fetch(`${backendBaseUrl}/api/veiculos`);
        if (!response.ok) throw new Error('Erro ao buscar veículos.');
        
        const veiculos = await response.json();
        listaContainer.innerHTML = '';

        if (veiculos.length === 0) {
            listaContainer.innerHTML = '<li>Nenhum veículo cadastrado na frota.</li>';
        } else {
            veiculos.forEach(veiculo => {
                const li = document.createElement('li');
                li.innerHTML = `
                    <span>${veiculo.placa} - ${veiculo.marca} ${veiculo.modelo} (${veiculo.ano})</span>
                    <div class="action-buttons">
                        <button class="btn-edit" data-id="${veiculo._id}">Editar</button>
                        <button class="btn-delete" data-id="${veiculo._id}">Excluir</button>
                    </div>
                `;
                listaContainer.appendChild(li);
            });
        }
    } catch (error) {
        listaContainer.innerHTML = `<li style="color: var(--danger);">Falha ao carregar a frota. Verifique se o servidor está rodando.</li>`;
    }
}

async function handleAdicionarVeiculoDB(event) {
    event.preventDefault();
    const form = event.target;
    const errorMessageElement = document.getElementById('form-error-message');
    
    // ---- A CORREÇÃO PRINCIPAL ESTÁ AQUI ----
    const veiculoData = {
        placa: form.querySelector('#vehicle-placa').value,
        marca: form.querySelector('#vehicle-marca').value,
        modelo: form.querySelector('#vehicle-modelo-db').value, // CORRIGIDO de '#vehicle-modelo' para '#vehicle-modelo-db'
        ano: form.querySelector('#vehicle-ano').value,
        cor: form.querySelector('#vehicle-cor').value,
    };
    
    try {
        const response = await fetch(`${backendBaseUrl}/api/veiculos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(veiculoData),
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error);
        }
        form.reset();
        errorMessageElement.textContent = '';
        await buscarEExibirVeiculos();
    } catch (error) {
        errorMessageElement.textContent = error.message;
    }
}

// ... (Restante do seu código, como handleListaClick, abrirModalEdicao, etc., continua aqui)
// (Colei a versão mais recente e completa para garantir)

async function handleListaClick(event) {
    const target = event.target;
    const id = target.dataset.id;

    if (target.classList.contains('btn-delete')) {
        if (confirm('Tem certeza que deseja excluir este veículo?')) {
            await deletarVeiculo(id);
        }
    }
    if (target.classList.contains('btn-edit')) {
        await abrirModalEdicao(id);
    }
}

async function abrirModalEdicao(id) {
    try {
        const response = await fetch(`${backendBaseUrl}/api/veiculos/${id}`);
        if (!response.ok) throw new Error('Falha ao buscar dados do veículo.');
        const veiculo = await response.json();
        
        editVehicleForm.querySelector('#edit-vehicle-id').value = veiculo._id;
        editVehicleForm.querySelector('#edit-vehicle-placa').value = veiculo.placa;
        editVehicleForm.querySelector('#edit-vehicle-marca').value = veiculo.marca;
        editVehicleForm.querySelector('#edit-vehicle-modelo').value = veiculo.modelo;
        editVehicleForm.querySelector('#edit-vehicle-ano').value = veiculo.ano;
        editVehicleForm.querySelector('#edit-vehicle-cor').value = veiculo.cor;
        
        document.getElementById('edit-form-error-message').textContent = '';
        editModal.style.display = 'flex';
    } catch (error) {
        alert(error.message);
    }
}

async function handleAtualizarVeiculo(event) {
    event.preventDefault();
    const form = event.target;
    const id = form.querySelector('#edit-vehicle-id').value;
    const errorMessageElement = document.getElementById('edit-form-error-message');
    const veiculoData = {
        placa: form.querySelector('#edit-vehicle-placa').value,
        marca: form.querySelector('#edit-vehicle-marca').value,
        modelo: form.querySelector('#edit-vehicle-modelo').value,
        ano: form.querySelector('#edit-vehicle-ano').value,
        cor: form.querySelector('#edit-vehicle-cor').value,
    };
    try {
        const response = await fetch(`${backendBaseUrl}/api/veiculos/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(veiculoData),
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error);
        }
        editModal.style.display = 'none';
        await buscarEExibirVeiculos();
    } catch (error) {
        errorMessageElement.textContent = error.message;
    }
}

async function deletarVeiculo(id) {
    try {
        const response = await fetch(`${backendBaseUrl}/api/veiculos/${id}`, { method: 'DELETE' });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error);
        }
        await buscarEExibirVeiculos();
    } catch (error) {
        alert(`Erro ao excluir: ${error.message}`);
    }
}


// ========================================================================
// --- CÓDIGO LEGADO (Garagem Visual e Clima) ---
// ========================================================================

// (Não vamos incluir o código legado aqui, pois ele não está sendo usado
// no HTML atual e estava causando conflitos. Esta versão é focada no CRUD.)


// ========================================================================
// --- INICIALIZAÇÃO E EVENT LISTENERS ---
// ========================================================================

document.addEventListener('DOMContentLoaded', () => {
    // Carrega a frota do banco de dados ao iniciar
    buscarEExibirVeiculos();

    // Adiciona listener APENAS ao formulário do banco de dados
    if (addVehicleDbForm) {
        addVehicleDbForm.addEventListener('submit', handleAdicionarVeiculoDB);
    }

    // Listeners para a lista (Editar/Excluir) e para o Modal
    if(listaContainer) listaContainer.addEventListener('click', handleListaClick);
    if(editVehicleForm) editVehicleForm.addEventListener('submit', handleAtualizarVeiculo);
    if(closeModalBtn) closeModalBtn.addEventListener('click', () => editModal.style.display = 'none');
    
    if(editModal) {
        editModal.addEventListener('click', (event) => {
            if (event.target === editModal) {
                editModal.style.display = 'none';
            }
        });
    }
});