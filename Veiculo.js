import mongoose from 'mongoose';

const veiculoSchema = new mongoose.Schema({
    placa: { type: String, required: true, unique: true, uppercase: true, trim: true },
    marca: { type: String, required: true },
    modelo: { type: String, required: true },
    ano: { type: Number, required: true, min: 1900 },
    cor: { type: String },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    // --- NOVO CAMPO PARA A IMAGEM ---
    imageUrl: {
        type: String,
        default: '' // Valor padrão caso nenhuma imagem seja enviada
    }
}, { 
    timestamps: true 
});

const Veiculo = mongoose.model('Veiculo', veiculoSchema);

export default Veiculo;