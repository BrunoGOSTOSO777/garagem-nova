// Importa os pacotes necessários
import express from 'express';
import dotenv from 'dotenv';
import axios from 'axios';

// Carrega as variáveis de ambiente do arquivo .env
dotenv.config();

// Inicializa o servidor Express
const app = express();
// O Render.com nos dará uma porta. Se estivermos rodando local, usamos 3001.
const PORT = process.env.PORT || 3001; 
const apiKey = process.env.OPENWEATHER_API_KEY;

// Middleware de CORS: ESSENCIAL para permitir que o frontend acesse este backend.
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*'); 
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

/**
 * Endpoint da API para Previsão do Tempo
 * Rota: GET /api/previsao/:cidade
 * Exemplo de uso: http://localhost:3001/api/previsao/Curitiba?unidade=metric
 */
app.get('/api/previsao/:cidade', async (req, res) => {
    const { cidade } = req.params;
    const { unidade } = req.query; // Pega a unidade da query string (ex: ?unidade=imperial)

    console.log(`[Backend] Recebida requisição para a cidade: ${cidade}`);

    if (!apiKey || apiKey === "SUA_CHAVE_DE_API_VAI_AQUI") {
        return res.status(500).json({ error: 'A chave da API do OpenWeatherMap não está configurada no servidor.' });
    }

    const geoApiUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${cidade}&limit=1&appid=${apiKey}`;

    try {
        // 1. Busca as coordenadas da cidade
        const geoResponse = await axios.get(geoApiUrl);
        if (geoResponse.data.length === 0) {
            return res.status(404).json({ error: 'Cidade não encontrada.' });
        }
        const { lat, lon } = geoResponse.data[0];

        // 2. Usa as coordenadas para buscar a previsão de 5 dias
        const forecastApiUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=${unidade || 'metric'}&lang=pt_br`;
        const forecastResponse = await axios.get(forecastApiUrl);
        
        console.log('[Backend] Previsão recebida. Enviando para o frontend.');
        
        // 3. Envia os dados de volta para o nosso frontend
        res.status(200).json(forecastResponse.data);

    } catch (error) {
        console.error("[Backend] Erro:", error.response?.data || error.message);
        const status = error.response?.status || 500;
        const message = error.response?.data?.message || 'Ocorreu um erro no servidor.';
        res.status(status).json({ error: message });
    }
});

// Inicia o servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor backend rodando em http://localhost:${PORT}`);
});