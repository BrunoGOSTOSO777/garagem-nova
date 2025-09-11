import Manutencao from './Manutencao.js';

/**
 * @class Veiculo
 * @classdesc Classe base que representa um veículo genérico na garagem.
 * As outras classes de veículos (Carro, Caminhao) herdam desta.
 */
export default class Veiculo {
    /**
     * Cria uma instância de Veiculo.
     * @param {string} modelo - O modelo do veículo.
     * @param {string} tipoClasse - O nome da classe específica (ex: 'Carro'), usado para recriar o objeto a partir do LocalStorage.
     */
    constructor(modelo, tipoClasse) {
        this.id = Date.now() + Math.random();
        this.modelo = modelo;
        this.tipoClasse = tipoClasse;
        this.imagem = `imagens/${tipoClasse.toLowerCase()}.png`;
        this.ligado = false;
        this.velocidade = 0;
        this.maxVelocidade = 180;
        this.historicoManutencao = [];
    }

    /**
     * Adiciona um novo registro de manutenção ao histórico do veículo.
     * @param {Manutencao} manutencao - A instância da classe Manutencao a ser adicionada.
     * @returns {void}
     */
    adicionarManutencao(manutencao) {
        this.historicoManutencao.push(manutencao);
        this.historicoManutencao.sort((a, b) => new Date(b.data) - new Date(a.data));
    }

    ligar() { this.ligado = true; }
    desligar() { if (this.velocidade === 0) this.ligado = false; }
    acelerar() { if (this.ligado && this.velocidade < this.maxVelocidade) this.velocidade += 10; }
    frear() { if (this.velocidade > 0) this.velocidade -= 15; if (this.velocidade < 0) this.velocidade = 0; }

    /**
     * Retorna informações básicas do veículo para exibição.
     * Este é um exemplo de Polimorfismo, pois as classes filhas podem sobrescrevê-lo.
     * @returns {string} Uma string formatada com as informações do veículo.
     */
    exibirInformacoes() {
        return `Modelo: ${this.modelo}\nTipo: ${this.tipoClasse}`;
    }
}