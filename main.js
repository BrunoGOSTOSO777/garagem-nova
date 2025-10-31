const backendBaseUrl = 'http://localhost:3001';

// --- SELETORES DE ELEMENTOS ---
const authView = document.getElementById('auth-view');
const appView = document.getElementById('app-view');
const listaContainer = document.getElementById('lista-frota-db');

// --- FUNÇÕES DE API ---
async function apiCall(endpoint, method = 'GET', body = null) {
    const headers = { 'Content-Type': 'application/json' };
    const token = localStorage.getItem('token');
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const options = { method, headers };
    if (body) {
        options.body = JSON.stringify(body);
    }

    const response = await fetch(`${backendBaseUrl}${endpoint}`, options);
    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || `Erro na requisição: ${response.status}`);
    }
    return data;
}

// --- LÓGICA DE AUTENTICAÇÃO ---
async function handleRegister(e) {
    e.preventDefault();
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const errorEl = document.getElementById('register-error');
    const successEl = document.getElementById('register-success');
    errorEl.textContent = '';
    successEl.textContent = '';
    try {
        const data = await apiCall('/api/auth/register', 'POST', { email, password });
        successEl.textContent = data.message;
        e.target.reset();
    } catch (error) {
        errorEl.textContent = error.message;
    }
}

async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const errorEl = document.getElementById('login-error');
    errorEl.textContent = '';
    try {
        const data = await apiCall('/api/auth/login', 'POST', { email, password });
        localStorage.setItem('token', data.token);
        initApp(); // Inicia a aplicação principal
    } catch (error) {
        errorEl.textContent = error.message;
    }
}

function handleLogout() {
    localStorage.removeItem('token');
    initApp(); // Reavalia a UI, que agora mostrará a tela de login
}

// --- LÓGICA DO CRUD DE VEÍCULOS ---
async function buscarEExibirVeiculos() {
    listaContainer.innerHTML = '<li>Carregando frota...</li>';
    try {
        const veiculos = await apiCall('/api/veiculos');
        listaContainer.innerHTML = '';
        if (veiculos.length === 0) {
            listaContainer.innerHTML = '<li>Nenhum veículo cadastrado. Adicione o primeiro!</li>';
        } else {
            veiculos.forEach(v => {
                const li = document.createElement('li');
                li.innerHTML = `<span>${v.placa} - ${v.marca} ${v.modelo}</span><div class="action-buttons"><button class="btn-delete" data-id="${v._id}">Excluir</button></div>`;
                listaContainer.appendChild(li);
            });
        }
    } catch (error) {
        listaContainer.innerHTML = `<li style="color: var(--danger);">${error.message}</li>`;
    }
}

async function handleAdicionarVeiculo(e) {
    e.preventDefault();
    const form = e.target;
    const msgEl = document.getElementById('form-error-message');
    msgEl.textContent = '';
    const data = {
        placa: form.querySelector('#vehicle-placa').value,
        marca: form.querySelector('#vehicle-marca').value,
        modelo: form.querySelector('#vehicle-modelo').value,
        ano: form.querySelector('#vehicle-ano').value,
        cor: form.querySelector('#vehicle-cor').value,
    };
    try {
        await apiCall('/api/veiculos', 'POST', data);
        form.reset();
        await buscarEExibirVeiculos();
    } catch (error) {
        msgEl.textContent = error.message;
    }
}

async function handleListaClick(e) {
    if (e.target.classList.contains('btn-delete')) {
        const id = e.target.dataset.id;
        if (confirm('Tem certeza que deseja excluir este veículo?')) {
            try {
                await apiCall(`/api/veiculos/${id}`, 'DELETE');
                await buscarEExibirVeiculos();
            } catch (error) {
                alert(error.message);
            }
        }
    }
}

// --- CONTROLE DE UI E INICIALIZAÇÃO ---
function updateView(isLoggedIn) {
    if (isLoggedIn) {
        authView.style.display = 'none';
        appView.style.display = 'block';
        buscarEExibirVeiculos();
    } else {
        authView.style.display = 'block';
        appView.style.display = 'none';
    }
}

function initApp() {
    const token = localStorage.getItem('token');
    if (token) {
        updateView(true);
    } else {
        updateView(false);
    }
}

// Adiciona os listeners de eventos
document.getElementById('register-form').addEventListener('submit', handleRegister);
document.getElementById('login-form').addEventListener('submit', handleLogin);
document.getElementById('logout-btn').addEventListener('click', handleLogout);
document.getElementById('add-vehicle-form').addEventListener('submit', handleAdicionarVeiculo);
listaContainer.addEventListener('click', handleListaClick);
document.getElementById('show-register').addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('login-form-container').style.display = 'none';
    document.getElementById('register-form-container').style.display = 'block';
});
document.getElementById('show-login').addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('register-form-container').style.display = 'none';
    document.getElementById('login-form-container').style.display = 'block';
});

// Inicializa a aplicação quando o DOM está pronto
document.addEventListener('DOMContentLoaded', initApp);