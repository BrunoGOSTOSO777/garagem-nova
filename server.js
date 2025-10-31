import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import User from './models/User.js';
import Veiculo from './models/Veiculo.js';
import authMiddleware from './middleware/auth.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const mongoUri = process.env.MONGO_URI_CRUD;
const jwtSecret = process.env.JWT_SECRET;

// Middlewares
app.use(express.json());
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    next();
});

// ========================================================================
// --- ROTAS DE AUTENTICAÇÃO (PÚBLICAS) ---
// ========================================================================

// ROTA DE REGISTRO
app.post('/api/auth/register', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ error: 'E-mail e senha são obrigatórios.' });

        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ error: 'Este e-mail já está em uso.' });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({ email, password: hashedPassword });
        await newUser.save();

        res.status(201).json({ message: 'Usuário registrado com sucesso!' });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao registrar usuário.' });
    }
});

// ROTA DE LOGIN
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ error: 'Credenciais inválidas.' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ error: 'Credenciais inválidas.' });

        const token = jwt.sign({ userId: user._id }, jwtSecret, { expiresIn: '1h' });

        res.json({ token, message: 'Login bem-sucedido!' });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao fazer login.' });
    }
});

// ========================================================================
// --- ROTAS DE VEÍCULOS (PROTEGIDAS) ---
// Todas as rotas abaixo exigem um token JWT válido.
// ========================================================================

// CREATE
app.post('/api/veiculos', authMiddleware, async (req, res) => {
    try {
        const veiculoData = { ...req.body, owner: req.user.id };
        const veiculo = await Veiculo.create(veiculoData);
        res.status(201).json(veiculo);
    } catch (e) {
        if (e.code === 11000) return res.status(409).json({ error: 'Veículo com esta placa já existe.' });
        if (e.name === 'ValidationError') return res.status(400).json({ error: Object.values(e.errors).map(v => v.message).join(' ') });
        res.status(500).json({ error: 'Erro ao criar veículo.' });
    }
});

// READ (ALL from logged in user)
app.get('/api/veiculos', authMiddleware, async (req, res) => {
    try {
        const veiculos = await Veiculo.find({ owner: req.user.id }).sort({ createdAt: -1 });
        res.json(veiculos);
    } catch (e) {
        res.status(500).json({ error: 'Erro ao buscar veículos.' });
    }
});

// UPDATE
app.put('/api/veiculos/:id', authMiddleware, async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ error: 'ID inválido.' });
        const veiculo = await Veiculo.findById(req.params.id);
        if (!veiculo) return res.status(404).json({ error: 'Veículo não encontrado.' });
        if (veiculo.owner.toString() !== req.user.id) return res.status(403).json({ error: 'Acesso negado.' });
        
        const veiculoAtualizado = await Veiculo.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        res.json(veiculoAtualizado);
    } catch (e) {
        if (e.code === 11000) return res.status(409).json({ error: 'Já existe um veículo com esta placa.' });
        res.status(500).json({ error: 'Erro ao atualizar veículo.' });
    }
});

// DELETE
app.delete('/api/veiculos/:id', authMiddleware, async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ error: 'ID inválido.' });
        const veiculo = await Veiculo.findById(req.params.id);
        if (!veiculo) return res.status(404).json({ error: 'Veículo não encontrado.' });
        if (veiculo.owner.toString() !== req.user.id) return res.status(403).json({ error: 'Acesso negado.' });

        await Veiculo.findByIdAndDelete(req.params.id);
        res.json({ message: 'Veículo deletado com sucesso!' });
    } catch (e) {
        res.status(500).json({ error: 'Erro ao deletar veículo.' });
    }
});

// --- Inicialização ---
async function startServer() {
    if (!mongoUri || !jwtSecret) {
        console.error("ERRO FATAL: Variáveis de ambiente MONGO_URI_CRUD e JWT_SECRET devem ser definidas!");
        process.exit(1);
    }
    try {
        await mongoose.connect(mongoUri);
        console.log("🚀 Conectado ao MongoDB Atlas!");
        app.listen(PORT, () => console.log(`🔌 Servidor com autenticação rodando em http://localhost:${PORT}`));
    } catch (error) {
        console.error("❌ Falha ao conectar ao MongoDB:", error.message);
        process.exit(1);
    }
}

startServer();