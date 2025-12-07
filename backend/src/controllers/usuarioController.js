const bcrypt = require("bcrypt");
const db = require("../config/db_connection");
const { createLog } = require("./logController");

async function listarUsuarios(req, res) {
  try {
    const [rows] = await db.query(`SELECT id, nome, email, role, created_at, updated_at FROM usuarios`);

    return res.json(rows);
  } catch (error) {
    console.error("Erro listarUsuarios:", error);
    res.status(500).json({ error: "Erro interno no servidor." });
  }
}

async function criarUsuario(req, res) {
  try {
    const { nome, email, senha, tipo } = req.body;

    if (!nome || !email || !senha || !tipo)
        return res.status(400).json({ error: "Todos os campos são obrigatórios." });

    const [existe] = await db.query(`SELECT id FROM usuarios WHERE email = ?`, [email]);

    if (existe.length > 0)
        return res.status(400).json({ error: "Email já está em uso." });

    const senhaHash = await bcrypt.hash(senha, 10);

    const [result] = await db.query(`INSERT INTO usuarios (nome, email, senha, role) VALUES (?, ?, ?, ?)`, [nome, email, senhaHash, tipo]);

    await createLog({
      usuario_id: req.usuario.id,
      acao: "Criado um usuario",
      entidade: "usuario",
      entidade_id: result.insertId,
      descricao: `Usuario ${nome} criado`
    });

    return res.status(201).json({ message: "Usuário criado com sucesso!",
      usuario: {
        id: result.insertId,
        nome,
        email,
        role: tipo
      }
    });
  } catch (error) {
    console.error("Erro criarUsuario:", error);
    res.status(500).json({ error: "Erro interno no servidor." });
  }
}

async function atualizarUsuario(req, res) {
  try {
    const { id } = req.params;
    const { nome, email, senha, tipo } = req.body;

    const [existe] = await db.query(`SELECT * FROM usuarios WHERE id = ?`, [id]);

    if (existe.length === 0)
      return res.status(404).json({ error: "Usuário não encontrado." });

    let senhaHash = existe[0].senha;
    if (senha || senha.trim() !== "") {
      senhaHash = await bcrypt.hash(senha, 10);
    }

    await db.query(`UPDATE usuarios SET nome = ?, email = ?, senha = ?, role = ? WHERE id = ?`,[nome, email, senhaHash, tipo, id]);

    await createLog({
      usuario_id: req.usuario.id,
      acao: "Atualizado um usuario",
      entidade: "usuario",
      entidade_id: id,
      descricao: `Usuario ${nome} atualizado`
    });

    return res.json({ message: "Usuário atualizado com sucesso!" });
  } catch (error) {
    console.error("Erro atualizarUsuario:", error);
    res.status(500).json({ error: "Erro interno no servidor." });
  }
}

async function deletarUsuario(req, res) {
  try {
    const { id } = req.params;

    const [existe] = await db.query(`SELECT id FROM usuarios WHERE id = ?`, [id]);

    if (existe.length === 0)
      return res.status(404).json({ error: "Usuário não encontrado." });

    await db.query(`DELETE FROM usuarios WHERE id = ?`, [id]);

    await createLog({
      usuario_id: req.usuario.id,
      acao: "Removido um usuario",
      entidade: "usuario",
      entidade_id: id,
      descricao: `Usuario ${id} removido`
    });

    return res.json({ message: "Usuário removido com sucesso!" });
  } catch (error) {
    console.error("Erro deletarUsuario:", error);
    res.status(500).json({ error: "Erro interno no servidor." });
  }
}

module.exports = {
  listarUsuarios,
  criarUsuario,
  atualizarUsuario,
  deletarUsuario
};
