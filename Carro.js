import Veiculo from './Veiculo.js';

/**
 * @class Carro
 * @classdesc Representa um carro comum, herdando de Veiculo.
 * @extends Veiculo
 */
export default class Carro extends Veiculo {
    /**
     * Cria uma instância de Carro.
     * @param {string} modelo - O modelo do carro.
     */
    constructor(modelo) {
        super(modelo, 'Carro');
    }
}