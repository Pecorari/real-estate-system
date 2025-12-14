const jwt = require("jsonwebtoken");
const db = require("../config/db_connection");

async function isAuth(req, res, next) {
  try {
    const token = req.cookies.token;

    if (!token) return res.status(401).json({ error: "Token não encontrado." });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Busca o usuário real no DB
    const [rows] = await db.query(`SELECT id, nome, email, role FROM usuarios WHERE id = ?`, [decoded.id]);

    if (rows.length === 0) return res.status(401).json({ error: "Usuário não encontrado." });

    req.usuario = rows[0];
    
    next();
  } catch (error) {
    return res.status(401).json({ error: "Token inválido ou expirado." });
  }
};

async function isAdmin(req, res, next) {
  try {
    if (!req.usuario) return res.status(401).json({ error: "Não autenticado." });
    
    if (!req.usuario || req.usuario.role !== "admin") return res.status(403).json({ error: "Acesso permitido somente para administradores." });
    
    next()
  } catch (error) {
    return res.status(401).json({ error: "Nao conseguimos verificar a permissao." });
  }
}

module.exports = {
  isAuth,
  isAdmin
}
