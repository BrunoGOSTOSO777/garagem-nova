import Garagem from './classes/Garagem.js';
import Manutencao from './classes/Manutencao.js';
import Carro from './classes/Carro.js';
import CarroEsportivo from './classes/CarroEsportivo.js';
import Caminhao from './classes/Caminhao.js';

// --- INICIALIZAÇÃO E LÓGICA DA UI ---
const garagem = new Garagem();

/**
 * Função executada quando o DOM está totalmente carregado.
 * Carrega os dados salvos, configura os event listeners e atualiza a UI.
 */
document.addEventListener('DOMContentLoaded', () => {
    garagem.carregar();
    configurarEventListeners();
    atualizarUICompleta();
});

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

    // Formulário de manutenção
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

    // Delegação de eventos para botões de ação e seleção
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
 * É chamada após qualquer mudança de estado na aplicação.
 */
function atualizarUICompleta() {
    const veiculo = garagem.veiculoAtual;

    // Atualiza o painel do veículo
    atualizarPainelVeiculo(veiculo);

    // Atualiza os seletores de veículo
    atualizarSeletores(veiculo);
    
    // Atualiza os controles específicos
    atualizarControlesEspecificos(veiculo);

    // Atualiza o painel de manutenção
    atualizarPainelManutencao(veiculo);

    // Atualiza painel de notificações
    atualizarNotificacoes();
}

// ... (Restante das funções de UI, separadas para clareza) ...

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

function atualizarNotificacoes() {
    const notificationsDiv = document.getElementById('notifications-list');
    notificationsDiv.innerHTML = '';
    const hoje = new Date();
    const umaSemanaDepois = new Date();
    umaSemanaDepois.setDate(hoje.getDate() + 7);
    const futuras = [];
    garagem.veiculos.forEach(v => {
        v.historicoManutencao.forEach(m => {
            const dataM = new Date(m.data + 'T00:00:00');
            if (dataM >= hoje && dataM <= umaSemanaDepois) {
                futuras.push({ veiculo: v, manutencao: m });
            }
        });
    });
    if (futuras.length === 0) {
        notificationsDiv.innerHTML = '<p>Nenhum agendamento para os próximos 7 dias.</p>';
    } else {
        futuras.sort((a, b) => new Date(a.manutencao.data) - new Date(b.manutencao.data));
        futuras.forEach(item => {
            const div = document.createElement('div');
            div.className = 'notification-item';
            div.textContent = `${item.veiculo.modelo}: ${item.manutencao.formatar()}`;
            notificationsDiv.appendChild(div);
        });
    }
}