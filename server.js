import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import multer from 'multer'; // 1. Importa o multer

// Carrega as variáveis de ambiente ANTES de qualquer outro código
dotenv.config();

import User from './models/User.js';
import Veiculo from './models/Veiculo.js';
import authMiddleware from './middleware/auth.js';

const app = express();
const PORT = process.env.PORT || 3001;
// Usa as variáveis do .env
const mongoUri = process.env.MONGO_URI_CRUD;
const jwtSecret = process.env.JWT_SECRET;

// --- 2. CONFIGURAÇÃO DO MULTER PARA UPLOAD DE IMAGENS ---
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Onde salvar os arquivos
  },
  filename: function (req, file, cb) {
    // Cria um nome de arquivo único para evitar sobreposição
    cb(null, Date.now() + '-' + file.originalname.replace(/\s/g, '_'));
  }
});
const upload = multer({ storage: storage });

// Middlewares
app.use(express.json());
// --- 3. SERVINDO ARQUIVOS ESTÁTICOS DA PASTA UPLOADS ---
// Permite que o frontend acesse as imagens via URL (ex: http://localhost:3001/uploads/imagem.jpg)
app.use('/uploads', express.static('uploads'));
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    next();
});

// --- ROTAS DE AUTENTICAÇÃO ---
app.post('/api/auth/register', async (req, res) => { /* ... código mantido ... */ });
app.post('/api/auth/login', async (req, res) => { /* ... código mantido ... */ });
app.post('/api/auth/register',async(req,res)=>{try{const{email:e,password:s}=req.body;if(!e||!s)return res.status(400).json({error:"E-mail e senha são obrigatórios."});const o=await User.findOne({email:e});if(o)return res.status(400).json({error:"Este e-mail já está em uso."});const t=await bcrypt.genSalt(10),a=await bcrypt.hash(s,t),r=new User({email:e,password:a});await r.save(),res.status(201).json({message:"Usuário registrado com sucesso!"})}catch(e){res.status(500).json({error:"Erro ao registrar usuário."})}});app.post('/api/auth/login',async(req,res)=>{try{const{email:e,password:s}=req.body,o=await User.findOne({email:e});if(!o)return res.status(400).json({error:"Credenciais inválidas."});const t=await bcrypt.compare(s,o.password);if(!t)return res.status(400).json({error:"Credenciais inválidas."});const a=jwt.sign({userId:o._id,email:o.email},jwtSecret,{expiresIn:"1h"});res.json({token:a,message:"Login bem-sucedido!"})}catch(e){res.status(500).json({error:"Erro ao fazer login."})}});

// --- ROTAS DE VEÍCULOS (PROTEGIDAS) ---

// --- 4. ROTA DE CRIAÇÃO ATUALIZADA PARA ACEITAR IMAGEM ---
app.post('/api/veiculos', authMiddleware, upload.single('imagem'), async (req, res) => {
    try {
        const { placa, marca, modelo, ano, cor } = req.body;
        
        // Pega o caminho do arquivo enviado ou define como nulo
        const imageUrl = req.file ? req.file.path.replace(/\\/g, '/') : null;

        const veiculoData = {
            placa, marca, modelo, ano, cor, imageUrl,
            owner: req.user.id
        };

        const veiculo = await Veiculo.create(veiculoData);
        res.status(201).json(veiculo);
    } catch (e) {
        if (e.code === 11000) return res.status(409).json({ error: 'Veículo com esta placa já existe.' });
        if (e.name === 'ValidationError') return res.status(400).json({ error: Object.values(e.errors).map(v => v.message).join(' ') });
        res.status(500).json({ error: 'Erro ao criar veículo.' });
    }
});

// READ (ALL)
app.get('/api/veiculos', authMiddleware, async (req, res) => { /* ... código mantido ... */ });
app.get('/api/veiculos',authMiddleware,async(req,res)=>{try{const e=await Veiculo.find({owner:req.user.id}).sort({createdAt:-1});res.json(e)}catch(e){res.status(500).json({error:"Erro ao buscar veículos."})}});

// DELETE
app.delete('/api/veiculos/:id', authMiddleware, async (req, res) => { /* ... código mantido ... */ });
app.delete('/api/veiculos/:id',authMiddleware,async(req,res)=>{try{if(!mongoose.Types.ObjectId.isValid(req.params.id))return res.status(400).json({error:"ID inválido."});const e=await Veiculo.findById(req.params.id);if(!e)return res.status(404).json({error:"Veículo não encontrado."});if(e.owner.toString()!==req.user.id)return res.status(403).json({error:"Acesso negado."});await Veiculo.findByIdAndDelete(req.params.id),res.json({message:"Veículo deletado com sucesso!"})}catch(e){res.status(500).json({error:"Erro ao deletar veículo."})}});

// --- Inicialização ---
async function startServer() {
    if (!mongoUri || !jwtSecret) {
        console.error("ERRO FATAL: Variáveis de ambiente MONGO_URI_CRUD e JWT_SECRET devem ser definidas!");
        process.exit(1);
    }
    try {
        await mongoose.connect(mongoUri);
        console.log("🚀 Conectado ao MongoDB Atlas!");
        app.listen(PORT, () => console.log(`🔌 Servidor com upload rodando em http://localhost:${PORT}`));
    } catch (error) {
        console.error("❌ Falha ao conectar ao MongoDB:", error.message);
        process.exit(1);
    }
}
startServer();