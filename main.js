const backendBaseUrl = 'http://localhost:3001';

const authView = document.getElementById('auth-view');
const appView = document.getElementById('app-view');
const listaContainer = document.getElementById('lista-frota-db');

// --- LÓGICA DE AUTENTICAÇÃO ---
async function apiCall(endpoint, method = 'GET', body = null, isFormData = false) {
    const headers = {};
    const token = localStorage.getItem('token');
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    if (!isFormData) {
        headers['Content-Type'] = 'application/json';
    }
    const options = { method, headers };
    if (body) {
        options.body = isFormData ? body : JSON.stringify(body);
    }
    const response = await fetch(`${backendBaseUrl}${endpoint}`, options);
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error || `Erro ${response.status}`);
    }
    return data;
}

async function handleRegister(e) { /* ... código mantido ... */ }
async function handleLogin(e) { /* ... código mantido ... */ }
function handleLogout() { localStorage.removeItem('token'); initApp(); }
async function handleRegister(e){e.preventDefault();const t=document.getElementById("register-email").value,o=document.getElementById("register-password").value,n=document.getElementById("register-error"),c=document.getElementById("register-success");n.textContent="",c.textContent="";try{const e=await apiCall("/api/auth/register","POST",{email:t,password:o});c.textContent=e.message+" Agora você pode fazer login.",document.getElementById("register-form").reset()}catch(e){n.textContent=e.error}}async function handleLogin(e){e.preventDefault();const t=document.getElementById("login-email").value,o=document.getElementById("login-password").value,n=document.getElementById("login-error");n.textContent="";try{const e=await apiCall("/api/auth/login","POST",{email:t,password:o});localStorage.setItem("token",e.token),initApp()}catch(e){n.textContent=e.error}}

// --- LÓGICA DO CRUD DE VEÍCULOS ---
async function buscarEExibirVeiculos() {
    if (!listaContainer) return;
    listaContainer.innerHTML = '<li>Carregando frota...</li>';
    try {
        const veiculos = await apiCall('/api/veiculos');
        listaContainer.innerHTML = '';
        if (veiculos.length === 0) {
            listaContainer.innerHTML = '<li>Nenhum veículo cadastrado. Adicione o primeiro!</li>';
        } else {
            veiculos.forEach(v => {
                const li = document.createElement('li');
                // Constrói a URL da imagem. Usa um placeholder se não houver imagem.
                const imageUrl = v.imageUrl ? `${backendBaseUrl}/${v.imageUrl}` : 'https://via.placeholder.com/100x60.png?text=Sem+Foto';
                
                li.innerHTML = `
                    <img src="${imageUrl}" alt="Foto de ${v.modelo}" class="vehicle-image">
                    <div class="vehicle-details">
                        ${v.placa} - ${v.marca} ${v.modelo}
                    </div>
                    <div class="action-buttons">
                        <button class="btn-delete" data-id="${v._id}">Excluir</button>
                    </div>
                `;
                listaContainer.appendChild(li);
            });
        }
    } catch (error) {
        if (error.message.includes('Token')) handleLogout();
        else listaContainer.innerHTML = `<li style="color: var(--danger);">${error.message}</li>`;
    }
}

// --- LÓGICA DE ADICIONAR VEÍCULO ATUALIZADA PARA USAR FORMDATA ---
async function handleAdicionarVeiculo(e) {
    e.preventDefault();
    const form = e.target;
    const msgEl = document.getElementById('form-error-message');
    msgEl.textContent = '';
    
    // 1. Cria um objeto FormData diretamente do elemento do formulário.
    // Ele captura todos os campos, incluindo o de arquivo.
    const formData = new FormData(form);

    try {
        // 2. Chama a API enviando o FormData e indicando que não é JSON
        await apiCall('/api/veiculos', 'POST', formData, true);
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
            } catch (error) { alert(error.message); }
        }
    }
}

// --- CONTROLE DE UI E INICIALIZAÇÃO ---
function updateView(isLoggedIn) { /* ... código mantido ... */ }
function initApp() { /* ... código mantido ... */ }
function updateView(e){e?(authView.style.display="none",appView.style.display="block",buscarEExibirVeiculos()):(authView.style.display="block",appView.style.display="none")}function initApp(){const e=localStorage.getItem("token");updateView(!!e)}

// Adiciona os listeners de eventos
document.getElementById('register-form')?.addEventListener('submit', handleRegister);
document.getElementById('login-form')?.addEventListener('submit', handleLogin);
document.getElementById('logout-btn')?.addEventListener('click', handleLogout);
document.getElementById('add-vehicle-form')?.addEventListener('submit', handleAdicionarVeiculo);
listaContainer?.addEventListener('click', handleListaClick);
document.getElementById('show-register')?.addEventListener('click', (e) => { e.preventDefault(); document.getElementById('login-form-container').style.display = 'none'; document.getElementById('register-form-container').style.display = 'block'; });
document.getElementById('show-login')?.addEventListener('click', (e) => { e.preventDefault(); document.getElementById('register-form-container').style.display = 'none'; document.getElementById('login-form-container').style.display = 'block'; });

document.addEventListener('DOMContentLoaded', initApp);