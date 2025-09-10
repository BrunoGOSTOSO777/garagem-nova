// --- CLASSE DE MANUTENÇÃO ---
class Manutencao {
    constructor(data, tipo, custo, descricao = '') {
        this.data = data; // Formato YYYY-MM-DD
        this.tipo = tipo;
        this.custo = parseFloat(custo);
        this.descricao = descricao;
    }

    validar() {
        if (!this.data || !this.tipo || isNaN(this.custo) || this.custo < 0) {
            exibirAlerta("Dados da manutenção inválidos! Verifique data, tipo e custo.");
            return false;
        }
        return true;
    }

    formatar() {
        const dataFormatada = new Date(this.data + 'T00:00:00').toLocaleDateString('pt-BR');
        return `${this.tipo} em ${dataFormatada} - R$ ${this.custo.toFixed(2)}`;
    }
}

// --- CLASSES DE VEÍCULOS (ATUALIZADAS PARA PERSISTÊNCIA) ---
class Veiculo {
    constructor(modelo, tipoClasse) {
        this.id = Date.now() + Math.random(); // ID único para cada instância
        this.modelo = modelo;
        this.tipoClasse = tipoClasse; // 'Carro', 'CarroEsportivo', etc. Salvo para recriar o objeto
        this.imagem = `imagens/${tipoClasse.toLowerCase()}png`;
        this.ligado = false;
        this.velocidade = 0;
        this.maxVelocidade = 180;
        this.historicoManutencao = [];
    }

    adicionarManutencao(manutencao) {
        if (manutencao instanceof Manutencao && manutencao.validar()) {
            this.historicoManutencao.push(manutencao);
            this.historicoManutencao.sort((a, b) => new Date(b.data) - new Date(a.data));
        }
    }

    ligar() { if (!this.ligado) this.ligado = true; }
    desligar() {
        if (this.velocidade > 0) {
            exibirAlerta("Pare o veículo completamente antes de desligar!");
            return;
        }
        if (this.ligado) this.ligado = false;
    }
    acelerar() { if (this.ligado && this.velocidade < this.maxVelocidade) this.velocidade += 10; }
    frear() { if (this.velocidade > 0) this.velocidade -= 15; if(this.velocidade < 0) this.velocidade = 0; }

    exibirInformacoes() {
        return `Modelo: ${this.modelo}\nTipo: ${this.tipoClasse}`;
    }
}

class Carro extends Veiculo {
    constructor(modelo) { super(modelo, 'Carro'); }
}

class CarroEsportivo extends Veiculo {
    constructor(modelo) {
        super(modelo, 'CarroEsportivo');
        this.maxVelocidade = 300;
        this.turbo = false;
    }
    ativarTurbo() { if (this.ligado) { this.turbo = true; exibirAlerta("Turbo ativado!"); } }
    desativarTurbo() { this.turbo = false; exibirAlerta("Turbo desativado!"); }
    acelerar() {
        if(this.ligado){
            const incremento = this.turbo ? 30 : 15;
            if(this.velocidade < this.maxVelocidade) this.velocidade += incremento;
        }
    }
    exibirInformacoes() {
        return `${super.exibirInformacoes()}\nTurbo: ${this.turbo ? 'Ativado' : 'Desativado'}`;
    }
}

class Caminhao extends Veiculo {
    constructor(modelo) {
        super(modelo, 'Caminhao');
        this.maxVelocidade = 120;
        this.cargaAtual = 0;
        this.capacidadeMax = 50000;
    }
    carregar(peso) {
        if(this.ligado){
            exibirAlerta("Desligue o caminhão para carregar.");
            return;
        }
        if (this.cargaAtual + peso > this.capacidadeMax) {
            exibirAlerta(`Excesso de peso! A capacidade máxima de ${this.capacidadeMax}kg foi excedida.`);
        } else {
            this.cargaAtual += peso;
            exibirAlerta(`Carga de ${peso}kg adicionada. Carga total: ${this.cargaAtual}kg.`);
        }
    }
    exibirInformacoes() {
        return `${super.exibirInformacoes()}\nCarga: ${this.cargaAtual}kg / ${this.capacidadeMax}kg`;
    }
}

// --- CLASSE PRINCIPAL DA GARAGEM (GERENCIA O ESTADO) ---
class Garagem {
    constructor() {
        this.veiculos = [];
        this.veiculoAtual = null;
    }

    adicionarVeiculo(veiculo) {
        this.veiculos.push(veiculo);
        this.selecionarVeiculo(veiculo.id);
        this.salvar();
    }

    selecionarVeiculo(id) {
        this.veiculoAtual = this.veiculos.find(v => v.id === id) || null;
        atualizarUI();
    }

    salvar() {
        // Converte os objetos da garagem em uma string JSON e salva no LocalStorage do navegador.
        localStorage.setItem('garagemInteligente', JSON.stringify(this.veiculos));
        console.log("Garagem salva!");
    }

    carregar() {
        const dadosSalvos = localStorage.getItem('garagemInteligente');
        if (!dadosSalvos) return;

        const veiculosSalvos = JSON.parse(dadosSalvos);
        
        // **IMPORTANTE**: Os dados do JSON são objetos simples. Precisamos recriar as instâncias
        // das classes corretas (Carro, Caminhao, etc.) para que os métodos voltem a funcionar.
        this.veiculos = veiculosSalvos.map(dados => {
            let veiculo;
            switch(dados.tipoClasse) {
                case 'Carro': veiculo = new Carro(dados.modelo); break;
                case 'CarroEsportivo': veiculo = new CarroEsportivo(dados.modelo); break;
                case 'Caminhao': veiculo = new Caminhao(dados.modelo); break;
                default: return null;
            }
            
            Object.assign(veiculo, dados); // Copia as propriedades salvas (id, velocidade, etc.) para a nova instância

            // Recria também as instâncias de Manutencao
            veiculo.historicoManutencao = dados.historicoManutencao.map(m =>
                new Manutencao(m.data, m.tipo, m.custo, m.descricao)
            );
            return veiculo;
        }).filter(v => v); // Filtra qualquer resultado nulo

        if (this.veiculos.length > 0) {
            this.selecionarVeiculo(this.veiculos[0].id);
        }
    }
}

// --- INICIALIZAÇÃO E LÓGICA DA INTERFACE (UI) ---

const garagem = new Garagem();

document.addEventListener('DOMContentLoaded', () => {
    garagem.carregar();
    setupEventListeners();
    atualizarUI();
});

function setupEventListeners() {
    // Formulário para adicionar veículo
    document.getElementById('add-vehicle-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const tipo = document.getElementById('vehicle-type').value;
        const modelo = document.getElementById('vehicle-model').value;
        if (!tipo || !modelo) return;

        let novoVeiculo;
        switch(tipo) {
            case 'Carro': novoVeiculo = new Carro(modelo); break;
            case 'CarroEsportivo': novoVeiculo = new CarroEsportivo(modelo); break;
            case 'Caminhao': novoVeiculo = new Caminhao(modelo); break;
        }
        
        garagem.adicionarVeiculo(novoVeiculo);
        e.target.reset();
    });

    // Formulário de manutenção
    document.getElementById('maintenance-form').addEventListener('submit', (e) => {
        e.preventDefault();
        if (!garagem.veiculoAtual) return;

        const data = document.getElementById('maint-date').value;
        const tipo = document.getElementById('maint-type').value;
        const custo = document.getElementById('maint-cost').value;
        const desc = document.getElementById('maint-desc').value;

        const novaManutencao = new Manutencao(data, tipo, custo, desc);
        garagem.veiculoAtual.adicionarManutencao(novaManutencao);
        garagem.salvar();
        atualizarUI();
        e.target.reset();
    });

    // Delegação de eventos para todos os botões de ação
    document.querySelector('.main-container').addEventListener('click', (e) => {
        if (e.target.matches('.selector-btn')) {
            garagem.selecionarVeiculo(parseFloat(e.target.dataset.id));
        } else if (e.target.matches('button[data-action]')) {
            const veiculo = garagem.veiculoAtual;
            if (!veiculo) return;
            
            const acao = e.target.dataset.action;
            if (typeof veiculo[acao] === 'function') {
                veiculo[acao]();
                atualizarUI();
            }
        }
    });
}

// --- FUNÇÕES DE ATUALIZAÇÃO DA INTERFACE (UI) ---

function atualizarUI() {
    atualizarSeletoresDeVeiculo();
    atualizarPainelVeiculo();
    atualizarPainelControlesEspecificos();
    atualizarPainelManutencao();
    verificarAgendamentosFuturos();
}

function atualizarSeletoresDeVeiculo() {
    const container = document.querySelector('.vehicle-selector');
    container.innerHTML = '';
    garagem.veiculos.forEach(v => {
        const btn = document.createElement('button');
        btn.className = 'selector-btn';
        btn.textContent = v.modelo;
        btn.dataset.id = v.id;
        if (garagem.veiculoAtual && v.id === garagem.veiculoAtual.id) {
            btn.classList.add('active');
        }
        container.appendChild(btn);
    });
}

function atualizarPainelVeiculo() {
    const veiculo = garagem.veiculoAtual;
    const infoBox = document.getElementById('vehicle-info');
    const img = document.getElementById('vehicle-image');
    const statusText = document.getElementById('status-text');
    const speedText = document.getElementById('speed-text');
    const speedBar = document.getElementById('speed-bar');
    
    if (!veiculo) {
        infoBox.innerHTML = 'Adicione ou selecione um veículo para começar.';
        img.src = 'imagens/placeholder.png';
        statusText.textContent = 'N/A';
        speedText.textContent = '0 km/h';
        speedBar.value = 0;
        document.getElementById('status-indicator').className = 'status-off';
        return;
    }

    img.src = veiculo.imagem;
    infoBox.innerText = veiculo.exibirInformacoes();
    document.getElementById('status-indicator').className = veiculo.ligado ? 'status-on' : 'status-off';
    statusText.textContent = veiculo.ligado ? 'Ligado' : 'Desligado';
    speedBar.value = veiculo.velocidade;
    speedBar.max = veiculo.maxVelocidade;
    speedText.textContent = `${veiculo.velocidade} km/h`;
}

function atualizarPainelControlesEspecificos() {
    const container = document.getElementById('specific-controls');
    const veiculo = garagem.veiculoAtual;
    container.innerHTML = '';
    
    if (veiculo instanceof CarroEsportivo) {
        container.innerHTML = `
            <h3>Controles Específicos</h3>
            <div class="button-group">
                <button data-action="ativarTurbo">Ativar Turbo</button>
                <button data-action="desativarTurbo">Desativar Turbo</button>
            </div>`;
    } else if (veiculo instanceof Caminhao) {
        // O botão de carregar agora fica no painel de manutenção para associar um peso.
    }
}

function atualizarPainelManutencao() {
    const veiculo = garagem.veiculoAtual;
    const historyDiv = document.getElementById('maintenance-history');
    const title = document.getElementById('maintenance-title');
    const submitBtn = document.getElementById('maint-submit-btn');

    if (!veiculo) {
        title.textContent = 'Manutenção do Veículo';
        historyDiv.innerHTML = '<p>Selecione um veículo para ver o histórico.</p>';
        submitBtn.disabled = true;
        return;
    }

    title.textContent = `Manutenção de: ${veiculo.modelo}`;
    submitBtn.disabled = false;
    historyDiv.innerHTML = '';

    if (veiculo.historicoManutencao.length === 0) {
        historyDiv.innerHTML = '<p>Nenhum serviço registrado.</p>';
        return;
    }

    const hoje = new Date().setHours(0,0,0,0);
    veiculo.historicoManutencao.forEach(maint => {
        const item = document.createElement('div');
        item.className = 'maintenance-item';
        const dataManutencao = new Date(maint.data + 'T00:00:00').setHours(0,0,0,0);
        
        item.classList.add(dataManutencao >= hoje ? 'future' : 'past');
        item.textContent = maint.formatar();
        if(maint.descricao) item.title = `Descrição: ${maint.descricao}`;
        historyDiv.appendChild(item);
    });
}

function verificarAgendamentosFuturos() {
    const notificationsDiv = document.getElementById('notifications-list');
    notificationsDiv.innerHTML = '';
    let futuras = [];

    const hoje = new Date();
    const umaSemanaDepois = new Date();
    umaSemanaDepois.setDate(hoje.getDate() + 7);

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
        return;
    }

    futuras.sort((a,b) => new Date(a.manutencao.data) - new Date(b.manutencao.data));

    futuras.forEach(item => {
        const div = document.createElement('div');
        div.className = 'notification-item';
        div.textContent = `${item.veiculo.modelo}: ${item.manutencao.formatar()}`;
        notificationsDiv.appendChild(div);
    });
}

function exibirAlerta(msg){
    alert(msg);
}