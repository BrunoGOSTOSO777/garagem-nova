// models/Veiculo.js
import mongoose from 'mongoose';

// 1. Definir o Schema (a "planta" dos documentos na coleção 'veiculos')
// Isto é onde aplicamos a modelagem de dados e validações.
const veiculoSchema = new mongoose.Schema({
    placa: { 
        type: String, 
        required: [true, 'A placa é obrigatória.'], // Validação: obrigatório
        unique: true, // Validação: não pode haver placas duplicadas
        uppercase: true, // Sempre salva em maiúsculas
        trim: true // Remove espaços em branco do início e fim
    },
    marca: { 
        type: String, 
        required: [true, 'A marca é obrigatória.'] 
    },
    modelo: { 
        type: String, 
        required: [true, 'O modelo é obrigatório.'] 
    },
    ano: { 
        type: Number, 
        required: [true, 'O ano é obrigatório.'],
        min: [1900, 'O ano deve ser no mínimo 1900.'], // Validação: valor mínimo
        max: [new Date().getFullYear() + 1, 'O ano não pode ser no futuro.'] // Validação: valor máximo
    },
    cor: { 
        type: String 
    }
}, { 
    timestamps: true // Adiciona os campos createdAt e updatedAt automaticamente
});

// 2. Criar o Modelo a partir do Schema
// O Modelo é a interface que usamos no nosso código para realizar as operações CRUD.
const Veiculo = mongoose.model('Veiculo', veiculoSchema);

export default Veiculo;