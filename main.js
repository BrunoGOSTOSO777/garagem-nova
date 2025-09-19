import Garagem from './classes/Garagem.js';
import Manutencao from './classes/Manutencao.js';
import Carro from './classes/Carro.js';
import CarroEsportivo from './classes/CarroEsportivo.js';
import Caminhao from './classes/Caminhao.js';

// --- INICIALIZAÇÃO E LÓGICA DA UI ---
const garagem = new Garagem();

document.addEventListener('DOMContentLoaded', () => {
    garagem.carregar();
    configurarEventListeners();
    atualizarUICompleta();
});


// ========================================================================
// --- SEÇÃO DA API DE PREVISÃO DO TEMPO INTERATIVA ---
// ========================================================================

// !!!!!   COLE SUA CHAVE DE API AQUI (SE AINDA NÃO FEZ)   !!!!!
const OPENWEATHER_API_KEY = "SUA_CHAVE_DE_API_VAI_AQUI"; 
// !!!!!   AVISO: Em um projeto real, esta chave nunca deve ficar no código.

/** Objeto para manter o estado atual das preferências e dados do clima. */
const weatherState = {
    cidade: null,
    unidade: localStorage.getItem('weatherUnit') || 'metric',
    diasParaMostrar: 5,
    destaques: { rain: false, cold: false, hot: false },
    dadosCompletos: [],
};

async function getCoordenadas(cidade) {
    if (OPENWEATHER_API_KEY === "SUA_CHAVE_DE_API_VAI_AQUI") throw new Error("Chave de API não configurada no main.js.");
    const url = `https://api.openweathermap.org/geo/1.0/direct?q=${cidade}&limit=1&appid=${OPENWEATHER_API_KEY}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Erro ao buscar coordenadas.");
    const data = await response.json();
    if (data.length === 0) throw new Error("Cidade não encontrada.");
    return { lat: data[0].lat, lon: data[0].lon };
}

async function getPrevisao5Dias(lat, lon, unidade) {
    const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=${unidade}&lang=pt_br`;
    const response = await fetch(url);
    if (!response.ok) {
        if (response.status === 401) throw new Error("Chave de API inválida ou não ativada.");
        throw new Error("Erro ao buscar previsão do tempo.");
    }
    return await response.json();
}

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
        const { lat, lon } = await getCoordenadas(weatherState.cidade);
        const dadosAPI = await getPrevisao5Dias(lat, lon, weatherState.unidade);
        weatherState.dadosCompletos = processarDadosForecast(dadosAPI);
        exibirPrevisaoDetalhada();
    } catch (error) {
        resultadoDiv.innerHTML = `<p style="color: var(--danger);"><strong>Erro:</strong> ${error.message}</p>`;
    }
}


/**
 * Configura todos os event listeners da aplicação.
 */
function configurarEventListeners() {
    // Formulário para adicionar veículo
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

    // Formulário de manutenção (sem alterações)
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

    // --- NOVO EVENT LISTENER PARA O BOTÃO DO CLIMA ---
    
    // --- LISTENERS PARA O PLANEJADOR DE VIAGEM INTERATIVO ---

// Listener principal do botão de verificar clima
document.getElementById('verificar-clima-btn').addEventListener('click', handleVerificarClima);

// Listeners dos filtros de dias (Desafio A)
document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        document.querySelector('.filter-btn.active').classList.remove('active');
        e.target.classList.add('active');
        weatherState.diasParaMostrar = parseInt(e.target.dataset.days);
        exibirPrevisaoDetalhada(); // Apenas re-renderiza, sem nova chamada de API
    });
});

// Listeners dos checkboxes de destaque (Desafio B)
document.querySelectorAll('#weather-controls input[type="checkbox"][data-highlight]').forEach(box => {
    box.addEventListener('click', (e) => {
        weatherState.destaques[e.target.dataset.highlight] = e.target.checked;
        exibirPrevisaoDetalhada(); // Apenas re-renderiza
    });
});

// Listener do toggle de unidades (Desafio C)
const unitToggle = document.getElementById('unit-toggle');
unitToggle.checked = weatherState.unidade === 'imperial'; // Sincroniza o visual com o estado
unitToggle.addEventListener('change', (e) => {
    weatherState.unidade = e.target.checked ? 'imperial' : 'metric';
    localStorage.setItem('weatherUnit', weatherState.unidade); // Salva a preferência
    if (weatherState.cidade) {
        // Se já tiver uma cidade, busca os dados novamente com a nova unidade
        handleVerificarClima();
    }
});

        // Exibe mensagem de "carregando"
        resultadoDiv.className = 'info';
        resultadoDiv.innerHTML = `<p>Buscando previsão para ${cidade}...</p>`;
        
        try {
            const previsao = await buscarPrevisaoTempo(cidade);
            
            // Exibe os resultados com sucesso
            resultadoDiv.className = 'sucesso';
            resultadoDiv.innerHTML = `
                <img src="https://openweathermap.org/img/wn/${previsao.icone}@2x.png" alt="Ícone do tempo">
                <div>
                    <strong>Clima em ${previsao.cidade}, ${previsao.pais}:</strong>
                    <p>${previsao.descricao.charAt(0).toUpperCase() + previsao.descricao.slice(1)}</p>
                    <p>Temperatura: ${previsao.temperatura.toFixed(1)}°C</p>
                </div>
            `;
        } catch (error) {
            // Exibe a mensagem de erro
            resultadoDiv.className = 'erro';
            resultadoDiv.innerHTML = `<p><strong>Erro:</strong> ${error.message}</p>`;
        }
    };

    // Delegação de eventos para botões de ação e seleção (sem alterações)
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


/**
 * Função central que atualiza toda a interface do usuário.
 */
function atualizarUICompleta() {
    // O resto desta seção não precisa de alterações
    const veiculo = garagem.veiculoAtual;
    atualizarPainelVeiculo(veiculo);
    atualizarSeletores(veiculo);
    atualizarControlesEspecificos(veiculo);
    atualizarPainelManutencao(veiculo);
    // ... (as outras funções de UI continuam as mesmas)
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
            const hoje = new Date().setHours(0, 0, 0, 0);
            veiculo.historicoManutencao.forEach(maint => {
                const item = document.createElement('div');
                item.className = 'maintenance-item';
                const dataManutencao = new Date(maint.data + 'T00:00:00').setHours(0, 0, 0, 0);
                item.classList.add(dataManutencao >= hoje ? 'future' : 'past');
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