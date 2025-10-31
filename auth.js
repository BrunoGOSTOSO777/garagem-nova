import jwt from 'jsonwebtoken';

const authMiddleware = (req, res, next) => {
    // 1. Pega o token do cabeçalho da requisição
    const authHeader = req.headers.authorization;

    // 2. Verifica se o cabeçalho existe e está no formato "Bearer <token>"
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Acesso negado. Token não fornecido.' });
    }

    const token = authHeader.split(' ')[1];

    try {
        // 3. Verifica se o token é válido usando o segredo
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // 4. Anexa o ID do usuário ao objeto `req` para ser usado nas rotas
        req.user = { id: decoded.userId };
        
        // 5. Passa para a próxima função (o controlador da rota)
        next();
    } catch (error) {
        res.status(401).json({ error: 'Token inválido.' });
    }
};

export default authMiddleware;