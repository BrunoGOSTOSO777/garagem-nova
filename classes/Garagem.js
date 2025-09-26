import Manutencao from './Manutencao.js';
import Carro from './Carro.js';
import CarroEsportivo from './CarroEsportivo.js';
import Caminhao from './Caminhao.js';

/**
 * @class Garagem
 * @classdesc Gerencia todos os veículos, o estado da aplicação e a persistência de dados.
 */
export default class Garagem {
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
    }

    /**
     * Salva a lista de veículos no LocalStorage do navegador.
     * Os objetos são convertidos para uma string JSON antes de serem salvos.
     * @returns {void}
     */
    salvar() {
        try {
            localStorage.setItem('garagemInteligenteFinal', JSON.stringify(this.veiculos));
        } catch (e) {
            console.error("Erro ao salvar dados no LocalStorage:", e);
        }
    }

    /**
     * Carrega os dados do LocalStorage e recria as instâncias das classes.
     * Este método é crucial pois o JSON.parse() cria objetos genéricos sem os métodos das classes.
     * É necessário recriar cada objeto (Veiculo, Manutencao) para restaurar sua funcionalidade.
     * @returns {void}
     */
    carregar() {
        const dadosSalvos = localStorage.getItem('garagemInteligenteFinal');
        if (!dadosSalvos) return;

        const veiculosSalvos = JSON.parse(dadosSalvos);
        
        this.veiculos = veiculosSalvos.map(dados => {
            let veiculo;
            switch(dados.tipoClasse) {
                case 'Carro': veiculo = new Carro(dados.modelo); break;
                case 'CarroEsportivo': veiculo = new CarroEsportivo(dados.modelo); break;
                case 'Caminhao': veiculo = new Caminhao(dados.modelo); break;
                default: return null;
            }
            
            Object.assign(veiculo, dados);

            veiculo.historicoManutencao = dados.historicoManutencao.map(m =>
                new Manutencao(m.data, m.tipo, m.custo, m.descricao)
            );
            return veiculo;
        }).filter(v => v);

        if (this.veiculos.length > 0) {
            this.veiculoAtual = this.veiculos[0];
        }
    }
}