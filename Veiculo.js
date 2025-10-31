import mongoose from 'mongoose';

const veiculoSchema = new mongoose.Schema({
    placa: { type: String, required: true, unique: true, uppercase: true, trim: true },
    marca: { type: String, required: true },
    modelo: { type: String, required: true },
    ano: { type: Number, required: true, min: 1900 },
    cor: { type: String },
    // --- O CAMPO DE RELACIONAMENTO ---
    owner: {
        type: mongoose.Schema.Types.ObjectId, // Armazena o ID do usuário
        ref: 'User', // A referência ao modelo 'User'
        required: true
    }
}, { 
    timestamps: true 
});

const Veiculo = mongoose.model('Veiculo', veiculoSchema);

export default Veiculo;