// adminMiddleware.js

const adminMiddleware = (req, res, next) => {
    // O authMiddleware já colocou o objeto 'user' na requisição (req)
    // Nós apenas verificamos se a propriedade 'role' dentro desse objeto é 'admin'
    if (req.user && req.user.role === 'admin') {
        next(); // Sucesso, o usuário é admin, pode prosseguir
    } else {
        // O usuário está autenticado, mas não tem permissão de admin
        res.status(403).json({ error: 'Acesso negado. Requer permissão de administrador.' });
    }
};

module.exports = adminMiddleware;