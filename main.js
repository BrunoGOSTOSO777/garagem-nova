import Garagem from './classes/Garagem.js';
import Manutencao from './classes/Manutencao.js';
import Carro from './classes/Carro.js';
import CarroEsportivo from './classes/CarroEsportivo.js';
import Caminhao from './classes/Caminhao.js';

const garagem = new Garagem();
// Define a URL base do nosso backend. Mude para a URL do Render após o deploy.
const backendBaseUrl = 'http://localhost:3001';

// ========================================================================
// --- SEÇÃO DA API - PREVISÃO DO TEMPO ---
// ========================================================================

const weatherState = { /* ... (código existente, sem alterações) ... */ };

async function getPrevisaoDoBackend(cidade, unidade) {
    const backendUrl = `${backendBaseUrl}/api/previsao/${cidade}?unidade=${unidade}`;
    const response = await fetch(backendUrl);
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Erro ${response.status} ao contatar o backend.`);
    }
    return await response.json();
}
// ... (todas as outras funções de previsão do tempo, como processarDadosForecast, etc. permanecem aqui sem alteração) ...
function processarDadosForecast(dadosAPI) {
    const previsoesPorDia = {};
    for (const previsao of dadosAPI.list) {
        const data = previsao.dt_txt.split(' ')[0];
        if (!previsoesPorDia[data]) {
            previsoesPorDia[data] = {
                data: data, temp_min: previsao.main.temp, temp_max: previsao.main.temp,
                descricoes: {}, icones: {}, vaiChover: false, detalhesPorHora: []
            };
        }
        const dia = previsoesPorDia[data];
        dia.temp_min = Math.min(dia.temp_min, previsao.main.temp);
        dia.temp_max = Math.max(dia.temp_max, previsao.main.temp);
        dia.descricoes[previsao.weather[0].description] = (dia.descricoes[previsao.weather[0].description] || 0) + 1;
        dia.icones[previsao.weather[0].icon] = (dia.icones[previsao.weather[0].icon] || 0) + 1;
        if (previsao.weather[0].main.toLowerCase() === 'rain') dia.vaiChover = true;
        dia.detalhesPorHora.push({
            hora: new Date(previsao.dt * 1000).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            temp: previsao.main.temp, icon: previsao.weather[0].icon,
        });
    }
    return Object.values(previsoesPorDia).map(dia => {
        dia.descricaoPrincipal = Object.keys(dia.descricoes).reduce((a, b) => dia.descricoes[a] > dia.descricoes[b] ? a : b);
        dia.iconePrincipal = Object.keys(dia.icones).reduce((a, b) => dia.icones[a] > dia.icones[b] ? a : b);
        return dia;
    });
}
function exibirPrevisaoDetalhada() {
    const container = document.getElementById('previsao-detalhada-resultado');
    if (weatherState.dadosCompletos.length === 0) {
        container.innerHTML = '<p>Digite uma cidade para ver a previsão detalhada.</p>';
        return;
    }
    const dadosFiltrados = weatherState.dadosCompletos.slice(0, weatherState.diasParaMostrar);
    const simboloTemp = weatherState.unidade === 'metric' ? '°C' : '°F';
    container.innerHTML = dadosFiltrados.map(dia => {
        const classesDestaque = [];
        if (weatherState.destaques.rain && dia.vaiChover) classesDestaque.push('dia-chuvoso');
        if (weatherState.destaques.cold && dia.temp_min < 10 && weatherState.unidade === 'metric') classesDestaque.push('temp-fria');
        if (weatherState.destaques.hot && dia.temp_max > 30 && weatherState.unidade === 'metric') classesDestaque.push('temp-quente');
        const detalhesHtml = dia.detalhesPorHora.map(d => `
            <div class="hour-detail">
                <strong>${d.hora}</strong>
                <img src="https://openweathermap.org/img/wn/${d.icon}.png" alt="">
                <span>${d.temp.toFixed(0)}${simboloTemp}</span>
            </div>`).join('');
        return `
            <div class="forecast-day ${classesDestaque.join(' ')}">
                <div class="summary">
                    <img src="https://openweathermap.org/img/wn/${dia.iconePrincipal}@2x.png" alt="${dia.descricaoPrincipal}">
                    <div>
                        <strong>${new Date(dia.data + 'T00:00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: '2-digit' })}</strong>
                        <p>${dia.descricaoPrincipal.charAt(0).toUpperCase() + dia.descricaoPrincipal.slice(1)}</p>
                    </div>
                    <div class="temp-range">${dia.temp_max.toFixed(0)}${simboloTemp} / ${dia.temp_min.toFixed(0)}${simboloTemp}</div>
                </div>
                <div class="details-extra">${detalhesHtml}</div>
            </div>`;
    }).join('');
    adicionarListenersAosCards();
}
function adicionarListenersAosCards() {
    document.querySelectorAll('.forecast-day').forEach(card => {
        card.addEventListener('click', () => {
            const details = card.querySelector('.details-extra');
            details.style.display = details.style.display === 'grid' ? 'none' : 'grid';
        });
    });
}
async function handleVerificarClima() {
    const cidadeInput = document.getElementById('destino-viagem');
    weatherState.cidade = cidadeInput.value.trim();
    const resultadoDiv = document.getElementById('previsao-detalhada-resultado');
    if (!weatherState.cidade) return alert("Por favor, digite uma cidade.");
    resultadoDiv.innerHTML = '<p>Buscando previsão...</p>';
    try {
        const dadosAPI = await getPrevisaoDoBackend(weatherState.cidade, weatherState.unidade);
        weatherState.dadosCompletos = processarDadosForecast(dadosAPI);
        exibirPrevisaoDetalhada();
    } catch (error) {
        resultadoDiv.innerHTML = `<p style="color: var(--danger);"><strong>Erro:</strong> ${error.message}</p>`;
    }
}


// ========================================================================
// --- NOVA SEÇÃO - API DE DICAS DE MANUTENÇÃO ---
// ========================================================================

/**
 * Busca as dicas gerais de manutenção no backend.
 */
async function buscarDicasGerais() {
    const listaContainer = document.getElementById('lista-dicas-gerais');
    try {
        const response = await fetch(`${backendBaseUrl}/api/dicas-manutencao`);
        if (!response.ok) throw new Error('Erro ao buscar dicas gerais.');
        
        const dicas = await response.json();
        exibirDicas(dicas, listaContainer);
    } catch (error) {
        listaContainer.innerHTML = `<li style="color: var(--danger);">${error.message}</li>`;
    }
}

/**
 * Busca dicas específicas para um tipo de veículo.
 */
async function buscarDicasEspecificas() {
    const tipoVeiculo = document.getElementById('tipo-veiculo-input').value.trim();
    const listaContainer = document.getElementById('lista-dicas-especificas');

    if (!tipoVeiculo) {
        listaContainer.innerHTML = `<li style="color: var(--warning);">Por favor, digite um tipo de veículo.</li>`;
        return;
    }

    try {
        const response = await fetch(`${backendBaseUrl}/api/dicas-manutencao/${tipoVeiculo}`);
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Erro desconhecido.');
        }
        
        const dicas = await response.json();
        exibirDicas(dicas, listaContainer);
    } catch (error) {
        listaContainer.innerHTML = `<li style="color: var(--danger);">${error.message}</li>`;
    }
}

/**
 * Função genérica para exibir uma lista de dicas na UI.
 * @param {Array<object>} dicas - Array de objetos, cada um com uma propriedade 'dica'.
 * @param {HTMLElement} container - O elemento UL onde as dicas serão inseridas.
 */
function exibirDicas(dicas, container) {
    container.innerHTML = ''; // Limpa a lista anterior
    if (dicas.length === 0) {
        container.innerHTML = '<li>Nenhuma dica encontrada.</li>';
        return;
    }
    dicas.forEach(item => {
        const li = document.createElement('li');
        li.textContent = item.dica;
        container.appendChild(li);
    });
}


// ========================================================================
// --- CONFIGURAÇÃO DOS EVENT LISTENERS ---
// ========================================================================

function configurarEventListeners() {
    // ... (listeners existentes, como 'add-vehicle-form' e 'maintenance-form') ...
    document.getElementById('add-vehicle-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const tipo = document.getElementById('vehicle-type').value;
        const modelo = document.getElementById('vehicle-model').value.trim();
        if (!tipo || !modelo) return;
        let novoVeiculo;
        switch(tipo) {
            case 'Carro': novoVeiculo = new Carro(modelo); break;
            case 'CarroEsportivo': novoVeiculo = new CarroEsportivo(modelo); break;
            case 'Caminhao': novoVeiculo = new Caminhao(modelo); break;
        }
        garagem.adicionarVeiculo(novoVeiculo);
        e.target.reset();
        atualizarUICompleta();
    });

    document.getElementById('maintenance-form').addEventListener('submit', (e) => {
        e.preventDefault();
        if (!garagem.veiculoAtual) return;
        const data = document.getElementById('maint-date').value;
        const tipo = document.getElementById('maint-type').value.trim();
        const custo = document.getElementById('maint-cost').value;
        const desc = document.getElementById('maint-desc').value.trim();
        const novaManutencao = new Manutencao(data, tipo, custo, desc);
        garagem.veiculoAtual.adicionarManutencao(novaManutencao);
        garagem.salvar();
        atualizarUICompleta();
        e.target.reset();
    });
    
    // Listeners do planejador de viagem
    document.getElementById('verificar-clima-btn').addEventListener('click', handleVerificarClima);
    // ... (outros listeners de clima) ...
     document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelector('.filter-btn.active').classList.remove('active');
            e.target.classList.add('active');
            weatherState.diasParaMostrar = parseInt(e.target.dataset.days);
            exibirPrevisaoDetalhada();
        });
    });

    document.querySelectorAll('#weather-controls input[type="checkbox"][data-highlight]').forEach(box => {
        box.addEventListener('click', (e) => {
            weatherState.destaques[e.target.dataset.highlight] = e.target.checked;
            exibirPrevisaoDetalhada();
        });
    });

    const unitToggle = document.getElementById('unit-toggle');
    unitToggle.checked = weatherState.unidade === 'imperial';
    unitToggle.addEventListener('change', (e) => {
        weatherState.unidade = e.target.checked ? 'imperial' : 'metric';
        localStorage.setItem('weatherUnit', weatherState.unidade);
        if (weatherState.cidade) {
            handleVerificarClima();
        }
    });

    // --- NOVOS LISTENERS PARA AS DICAS ---
    document.getElementById('buscar-dicas-gerais-btn').addEventListener('click', buscarDicasGerais);
    document.getElementById('buscar-dicas-especificas-btn').addEventListener('click', buscarDicasEspecificas);

    // Listener geral para botões de veículo
    document.querySelector('.main-container').addEventListener('click', (e) => {
        const target = e.target;
        if (target.matches('.selector-btn')) {
            garagem.selecionarVeiculo(parseFloat(target.dataset.id));
            atualizarUICompleta();
        } else if (target.matches('button[data-action]')) {
            if (!garagem.veiculoAtual) return;
            const acao = target.dataset.action;
            if (typeof garagem.veiculoAtual[acao] === 'function') {
                garagem.veiculoAtual[acao]();
                atualizarUICompleta();
            }
        }
    });
}

// ... (todas as funções de atualizarUICompleta, atualizarPainelVeiculo, etc. permanecem aqui sem alteração) ...
function atualizarUICompleta() {
    const veiculo = garagem.veiculoAtual;
    atualizarPainelVeiculo(veiculo);
    atualizarSeletores(veiculo);
    atualizarControlesEspecificos(veiculo);
    atualizarPainelManutencao(veiculo);
}
function atualizarPainelVeiculo(veiculo) {
    const infoBox = document.getElementById('vehicle-info');
    const img = document.getElementById('vehicle-image');
    if (veiculo) {
        img.src = veiculo.imagem;
        infoBox.innerText = veiculo.exibirInformacoes();
        document.getElementById('status-indicator').className = veiculo.ligado ? 'status-on' : 'status-off';
        document.getElementById('status-text').textContent = veiculo.ligado ? 'Ligado' : 'Desligado';
        const speedBar = document.getElementById('speed-bar');
        speedBar.value = veiculo.velocidade;
        speedBar.max = veiculo.maxVelocidade;
        document.getElementById('speed-text').textContent = `${veiculo.velocidade} km/h`;
    } else {
        img.src = 'imagens/placeholder.png';
        infoBox.innerHTML = '<p>Nenhum veículo selecionado.</p>';
        document.getElementById('status-text').textContent = 'N/A';
        document.getElementById('speed-text').textContent = '0 km/h';
    }
}
function atualizarSeletores(veiculo) {
    const selectorContainer = document.querySelector('.vehicle-selector');
    selectorContainer.innerHTML = '';
    garagem.veiculos.forEach(v => {
        const btn = document.createElement('button');
        btn.className = 'selector-btn';
        btn.textContent = v.modelo;
        btn.dataset.id = v.id;
        if (veiculo && v.id === veiculo.id) {
            btn.classList.add('active');
        }
        selectorContainer.appendChild(btn);
    });
}
function atualizarControlesEspecificos(veiculo) {
    const specificControls = document.getElementById('specific-controls');
    specificControls.innerHTML = '';
    if (veiculo instanceof CarroEsportivo) {
        specificControls.innerHTML = `
            <h3>Controles Específicos</h3>
            <div class="button-group">
                <button data-action="ativarTurbo">Ativar Turbo</button>
                <button data-action="desativarTurbo">Desativar Turbo</button>
            </div>`;
    }
}
function atualizarPainelManutencao(veiculo) {
    const historyDiv = document.getElementById('maintenance-history');
    const title = document.getElementById('maintenance-title');
    const submitBtn = document.getElementById('maint-submit-btn');
    if (veiculo) {
        title.textContent = `Manutenção de: ${veiculo.modelo}`;
        submitBtn.disabled = false;
        historyDiv.innerHTML = '';
        if (veiculo.historicoManutencao.length === 0) {
            historyDiv.innerHTML = '<p>Nenhum serviço registrado.</p>';
        } else {
            veiculo.historicoManutencao.forEach(maint => {
                const item = document.createElement('div');
                item.className = 'maintenance-item';
                item.textContent = maint.formatar();
                if (maint.descricao) item.title = `Descrição: ${maint.descricao}`;
                historyDiv.appendChild(item);
            });
        }
    } else {
        title.textContent = 'Manutenção do Veículo';
        historyDiv.innerHTML = '<p>Selecione um veículo para ver o histórico.</p>';
        submitBtn.disabled = true;
    }
}

// INICIALIZAÇÃO DA APLICAÇÃO
document.addEventListener('DOMContentLoaded', () => {
    garagem.carregar();
    configurarEventListeners();
    atualizarUICompleta();
});