// authMiddleware.js
const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Formato é "Bearer TOKEN"

    if (token == null) {
        return res.sendStatus(401); // Unauthorized - Sem token
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.sendStatus(403); // Forbidden - Token inválido ou expirado
        }
        req.user = user;
        next(); // Sucesso! Permite que a requisição continue para a rota principal
    });
};

module.exports = authMiddleware;