import Veiculo from './Veiculo.js';

/**
 * @class CarroEsportivo
 * @classdesc Representa um carro esportivo com funcionalidades adicionais como o turbo.
 * @extends Veiculo
 */
export default class CarroEsportivo extends Veiculo {
    /**
     * Cria uma instância de CarroEsportivo.
     * @param {string} modelo - O modelo do carro esportivo.
     */
    constructor(modelo) {
        // CORREÇÃO: Usar o nome da classe 'CarroEsportivo' para que a imagem seja encontrada corretamente.
        super(modelo, 'CarroEsportivo'); 
        this.maxVelocidade = 360;
        this.turbo = false;
    }

    ativarTurbo() { if (this.ligado) this.turbo = true; }
    desativarTurbo() { this.turbo = false; }

    /**
     * Sobrescreve o método acelerar da classe pai para incluir a lógica do turbo.
     * @override
     */
    acelerar() {
        if (this.ligado) {
            const incremento = this.turbo ? 35 : 15;
            if (this.velocidade < this.maxVelocidade) this.velocidade += incremento;
            else this.velocidade = this.maxVelocidade;
        }
    }

    /**
     * Sobrescreve o método de informações para incluir o status do turbo.
     * @override
     * @returns {string} Informações do veículo, incluindo o status do turbo.
     */
    exibirInformacoes() {
        return `${super.exibirInformacoes()}\nTurbo: ${this.turbo ? 'Ativado' : 'Desativado'}`;
    }
}