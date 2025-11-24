const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../config/db_connection");

const TOKEN_EXPIRES = "7d";

  async function login(req, res) {
    try {
        const { email, senha } = req.body;

        if (!email || !senha) return res.status(400).json({ error: "Email e senha são obrigatórios." });

        const [rows] = await db.query(`SELECT * FROM usuarios WHERE email = ?`, [email]);

        if (rows.length === 0) return res.status(401).json({ error: "Credenciais inválidas." });

        const usuario = rows[0];

        const senhaMatch = await bcrypt.compare(senha, usuario.senha_hash);

        if (!senhaMatch) return res.status(401).json({ error: "Credenciais inválidas." });

        const token = jwt.sign({ id: usuario.id, nome: usuario.nome, role: usuario.role }, process.env.JWT_SECRET, { expiresIn: TOKEN_EXPIRES });

        res.cookie("token", token, {
            httpOnly: true,
            secure: false, // colocar true em produção com HTTPS
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        return res.json({ message: "Login realizado com sucesso!", usuario: {
            id: usuario.id,
            nome: usuario.nome,
            email: usuario.email,
            role: usuario.role
        }});

    } catch (error) {
      console.error("Erro login:", error);
      res.status(500).json({ error: "Erro interno no servidor." });
    }
  }

  async function logout(_req, res) {
    try {
      res.clearCookie("token");
      return res.json({ message: "Logout realizado com sucesso!" });
    } catch (error) {
      console.error("Erro logout:", error);
      res.status(500).json({ error: "Erro interno no servidor." });
    }
  }

  async function me(req, res) {
    try {
      if (!req.usuario) {
        return res.status(401).json({ error: "Não autenticado." });
      }

      return res.json({
        usuario: {
          id: req.usuario.id,
          nome: req.usuario.nome,
          email: req.usuario.email,
          role: req.usuario.role
        }
      });

    } catch (error) {
      console.error("Erro me:", error);
      res.status(500).json({ error: "Erro interno no servidor." });
    }
  }


module.exports = {
    login,
    logout,
    me
}
