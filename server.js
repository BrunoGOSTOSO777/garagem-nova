// Importa os pacotes necessários
import express from 'express';
import dotenv from 'dotenv'; // << IMPORTADO
import axios from 'axios';
import mongoose from 'mongoose';

// ========================================================================
// --- CARREGAR VARIÁVEIS DE AMBIENTE ---
// !! ESTA LINHA DEVE VIR PRIMEIRO DE TUDO !!
dotenv.config();
// ========================================================================

// Agora que o .env foi carregado, podemos ler as variáveis com segurança
const mongoUriCrud = process.env.MONGO_URI_CRUD;
const apiKey = process.env.OPENWEATHER_API_KEY;

// ========================================================================
// --- CONEXÃO COM O MONGODB ATLAS ---
// ========================================================================

async function connectToDatabase() {
    // Verificação para garantir que a variável foi carregada
    if (!mongoUriCrud) {
        console.error("ERRO FATAL: A variável de ambiente MONGO_URI_CRUD não está definida!");
        console.error("Verifique se o arquivo .env existe, está salvo e contém a variável MONGO_URI_CRUD.");
        process.exit(1); // Encerra a aplicação
    }

    try {
        await mongoose.connect(mongoUriCrud);
        console.log("🚀 Conectado com sucesso ao MongoDB Atlas!");
    } catch (error) {
        console.error("❌ ERRO FATAL: Falha ao conectar ao MongoDB Atlas:", error.message);
        process.exit(1); // Encerra a aplicação
    }
}

// ========================================================================
// --- INICIALIZAÇÃO DO SERVIDOR E ROTAS ---
// ========================================================================

async function startServer() {
    // Primeiro, conecta ao banco de dados. O servidor só sobe se a conexão funcionar.
    await connectToDatabase();

    const app = express();
    const PORT = process.env.PORT || 3001;

    // Middleware de CORS
    app.use((req, res, next) => {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
        next();
    });

    // --- SEUS ENDPOINTS DA API ---
    // (Colei aqui o restante do seu código de API para garantir)
    
    // BANCO DE DADOS SIMULADO
    const dicasManutencaoGerais = [ { id: 1, dica: "Verifique o nível do óleo do motor regularmente." }, { id: 2, dica: "Calibre os pneus semanalmente para economizar combustível." }];
    const dicasPorTipo = { carro: [ { id: 10, dica: "Faça o rodízio dos pneus a cada 10.000 km." } ], moto: [ { id: 20, dica: "Lubrifique e ajuste a corrente frequentemente." } ], caminhao: [ { id: 30, dica: "Verifique o sistema de freios a ar." } ] };

    // Rota de Previsão do Tempo
    app.get('/api/previsao/:cidade', async (req, res) => { /* ... seu código de previsão do tempo ... */ });
    
    // Rota de Dicas Gerais
    app.get('/api/dicas-manutencao', (req, res) => { res.json(dicasManutencaoGerais); });
    
    // Rota de Dicas Específicas
    app.get('/api/dicas-manutencao/:tipoVeiculo', (req, res) => { const { tipoVeiculo } = req.params; const dicas = dicasPorTipo[tipoVeiculo.toLowerCase()]; if (dicas) { res.json(dicas); } else { res.status(404).json({ error: `Nenhuma dica encontrada para: ${tipoVeiculo}` }); } });

    // Rota 404
    app.use((req, res) => { res.status(404).json({ error: 'Endpoint não encontrado.' }); });

    // Inicia o servidor
    app.listen(PORT, () => {
        console.log(`🔌 Servidor backend rodando em http://localhost:${PORT}`);
    });
}

// Chama a função principal para iniciar o servidor
startServer();