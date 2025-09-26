/**
 * @class Manutencao
 * @classdesc Representa um único serviço de manutenção realizado em um veículo.
 */
export default class Manutencao {
    /**
     * Cria uma instância de Manutencao.
     * @param {string} data - A data do serviço no formato YYYY-MM-DD.
     * @param {string} tipo - O tipo de serviço realizado (ex: "Troca de óleo").
     * @param {number} custo - O custo do serviço.
     * @param {string} [descricao=''] - Uma descrição opcional do serviço.
     */
    constructor(data, tipo, custo, descricao = '') {
        this.data = data;
        this.tipo = tipo;
        this.custo = parseFloat(custo);
        this.descricao = descricao;
    }

    /**
     * Retorna uma string formatada para exibição na interface.
     * @returns {string} A descrição formatada da manutenção. Ex: "Troca de óleo em 25/12/2024 - R$ 150.00"
     */
    formatar() {
        const dataFormatada = new Date(this.data + 'T00:00:00').toLocaleDateString('pt-BR');
        return `${this.tipo} em ${dataFormatada} - R$ ${this.custo.toFixed(2)}`;
    }
}