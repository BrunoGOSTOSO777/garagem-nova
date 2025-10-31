// models/Manutencao.js
import mongoose from 'mongoose';

const manutencaoSchema = new mongoose.Schema({
    descricaoServico: {
        type: String,
        required: [true, 'A descrição do serviço é obrigatória.'],
    },
    data: {
        type: Date,
        required: true,
        default: Date.now, // Valor padrão é a data e hora atuais
    },
    custo: {
        type: Number,
        required: [true, 'O custo é obrigatório.'],
        min: [0, 'O custo não pode ser negativo.'],
    },
    quilometragem: {
        type: Number,
        min: [0, 'A quilometragem não pode ser negativa.'],
    },
    // --- O CAMPO DE RELACIONAMENTO ---
    // Armazena o ID do documento 'Veiculo' ao qual esta manutenção pertence.
    veiculo: {
        type: mongoose.Schema.Types.ObjectId, // Tipo especial para guardar IDs de outros documentos
        ref: 'Veiculo', // Informa ao Mongoose que este ID se refere a um modelo 'Veiculo'
        required: true,
    }
}, {
    timestamps: true // Adiciona createdAt e updatedAt
});

const Manutencao = mongoose.model('Manutencao', manutencaoSchema);

export default Manutencao;