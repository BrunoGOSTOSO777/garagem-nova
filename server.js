// Importa os pacotes necessários
import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Veiculo from './models/Veiculo.js';

// Carrega as variáveis de ambiente
dotenv.config();

// ========================================================================
// --- CONEXÃO COM O MONGODB ATLAS ---
// ========================================================================
const mongoUriCrud = process.env.MONGO_URI_CRUD;

async function connectToDatabase() {
    if (!mongoUriCrud) {
        console.error("ERRO FATAL: A variável de ambiente MONGO_URI_CRUD não está definida!");
        process.exit(1);
    }
    try {
        await mongoose.connect(mongoUriCrud);
        console.log("🚀 Conectado com sucesso ao MongoDB Atlas!");
    } catch (error) {
        console.error("❌ ERRO FATAL: Falha ao conectar ao MongoDB Atlas:", error.message);
        process.exit(1);
    }
}

// ========================================================================
// --- CONFIGURAÇÃO DO SERVIDOR EXPRESS ---
// ========================================================================
const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares essenciais
app.use(express.json());
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'); // Habilita PUT e DELETE
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

// ========================================================================
// --- ENDPOINTS CRUD COMPLETOS PARA VEÍCULOS ---
// ========================================================================

// ROTA CREATE (CRIAR): POST /api/veiculos
app.post('/api/veiculos', async (req, res) => {
    try {
        const veiculoCriado = await Veiculo.create(req.body);
        res.status(201).json(veiculoCriado);
    } catch (error) {
        if (error.code === 11000) return res.status(409).json({ error: 'Veículo com esta placa já existe.' });
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ error: messages.join(' ') });
        }
        res.status(500).json({ error: 'Erro interno ao criar veículo.' });
    }
});

// ROTA READ (LER TODOS): GET /api/veiculos
app.get('/api/veiculos', async (req, res) => {
    try {
        const todosOsVeiculos = await Veiculo.find().sort({ createdAt: -1 }); // Ordena pelos mais recentes
        res.json(todosOsVeiculos);
    } catch (error) {
        res.status(500).json({ error: 'Erro interno ao buscar veículos.' });
    }
});

// ROTA READ (LER UM): GET /api/veiculos/:id
app.get('/api/veiculos/:id', async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'ID de veículo inválido.' });
        }
        const veiculo = await Veiculo.findById(id);
        if (!veiculo) {
            return res.status(404).json({ error: 'Veículo não encontrado.' });
        }
        res.json(veiculo);
    } catch (error) {
        res.status(500).json({ error: 'Erro interno ao buscar veículo.' });
    }
});


// --- NOVO ENDPOINT ---
// ROTA UPDATE (ATUALIZAR): PUT /api/veiculos/:id
app.put('/api/veiculos/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const dadosAtualizados = req.body;

        // Validação robusta do ID
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'ID de veículo inválido.' });
        }

        const veiculoAtualizado = await Veiculo.findByIdAndUpdate(
            id, 
            dadosAtualizados, 
            { new: true, runValidators: true } // Opções importantes!
        );

        if (!veiculoAtualizado) {
            return res.status(404).json({ error: 'Veículo não encontrado para atualização.' });
        }

        console.log('[Servidor] Veículo atualizado:', veiculoAtualizado);
        res.json(veiculoAtualizado); // Retorna o documento já atualizado

    } catch (error) {
        // Tratamento de erros de validação durante o update
        if (error.code === 11000) return res.status(409).json({ error: 'Já existe um veículo com esta placa.' });
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ error: messages.join(' ') });
        }
        res.status(500).json({ error: 'Erro interno ao atualizar veículo.' });
    }
});

// --- NOVO ENDPOINT ---
// ROTA DELETE (DELETAR): DELETE /api/veiculos/:id
app.delete('/api/veiculos/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'ID de veículo inválido.' });
        }

        const veiculoDeletado = await Veiculo.findByIdAndDelete(id);

        if (!veiculoDeletado) {
            return res.status(404).json({ error: 'Veículo não encontrado para exclusão.' });
        }

        console.log('[Servidor] Veículo deletado:', veiculoDeletado._id);
        res.json({ message: 'Veículo deletado com sucesso!' });

    } catch (error) {
        res.status(500).json({ error: 'Erro interno ao deletar veículo.' });
    }
});


// ========================================================================
// --- INICIALIZAÇÃO DO SERVIDOR ---
// ========================================================================
async function startServer() {
    await connectToDatabase();
    app.listen(PORT, () => {
        console.log(`🔌 Servidor CRUD completo rodando em http://localhost:${PORT}`);
    });
}

startServer();