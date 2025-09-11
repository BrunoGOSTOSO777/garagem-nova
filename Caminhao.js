import Veiculo from './Veiculo.js';

/**
 * @class Caminhao
 * @classdesc Representa um caminhão, herdando de Veiculo.
 * @extends Veiculo
 */
export default class Caminhao extends Veiculo {
    /**
     * Cria uma instância de Caminhao.
     * @param {string} modelo - O modelo do caminhão.
     */
    constructor(modelo) {
        super(modelo, 'Caminhao');
        this.maxVelocidade = 120;
    }
}