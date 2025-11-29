const db = require("../db_connection");

async function listarArquivos(req, res) {
  try {
    const [rows] = await db.query(`
        SELECT 
            a.*,
            locador.nome AS locador_nome,
            locatario.nome AS locatario_nome
        FROM arquivos a
        LEFT JOIN clientes locador ON locador.id = a.cliente_locador_id
        LEFT JOIN clientes locatario ON locatario.id = a.cliente_locatario_id
        ORDER BY a.id DESC
    `);

    return res.json(rows);
  } catch (error) {
    console.error("Erro ao listar arquivos:", error);
    return res.status(500).json({ error: "Erro ao listar registros." });
  }
}

async function criarArquivo(req, res) {
  try {
    const { cliente_locador_id, cliente_locatario_id, data_inicio, data_fim, status, observacoes } = req.body;

    if (!cliente_locador_id || !cliente_locatario_id || !data_inicio) {
      return res.status(400).json({
        error: "Campos obrigatórios: cliente_locador_id, cliente_locatario_id, data_inicio."
      });
    }

    const [result] = await db.query(`INSERT INTO arquivos (cliente_locador_id, cliente_locatario_id, data_inicio, data_fim, status, observacoes) VALUES (?, ?, ?, ?, ?, ?)`,
      [cliente_locador_id, cliente_locatario_id, data_inicio, data_fim || null, status, observacoes || null]
    );

    return res.json({ message: "Registro criado com sucesso!", id: result.insertId });
  } catch (error) {
    console.error("Erro ao criar arquivo:", error);
    return res.status(500).json({ error: "Erro ao criar registro." });
  }
}

async function atualizarArquivo(req, res) {
  try {
    const { id } = req.params;

    const { cliente_locador_id, cliente_locatario_id, data_inicio, data_fim, status, observacoes } = req.body;

    const [existe] = await db.query("SELECT * FROM arquivos WHERE id = ?", [id]);
    if (existe.length === 0) return res.status(404).json({ error: "Registro não encontrado." });

    await db.query(`UPDATE arquivos SET cliente_locador_id=?, cliente_locatario_id=?, data_inicio=?, data_fim=?, status=?, observacoes=?, updated_at=CURRENT_TIMESTAMPWHERE id=?`,
      [cliente_locador_id, cliente_locatario_id, data_inicio, data_fim || null, status, observacoes || null, id]
    );

    return res.json({ message: "Registro atualizado com sucesso!" });
  } catch (error) {
    console.error("Erro ao atualizar arquivo:", error);
    return res.status(500).json({ error: "Erro ao atualizar registro." });
  }
}

async function deletarArquivo(req, res) {
  try {
    const { id } = req.params;

    const [existe] = await db.query("SELECT * FROM arquivos WHERE id = ?", [id]);
    if (!existe.length) return res.status(404).json({ error: "Registro não encontrado." });

    await db.query("DELETE FROM arquivos WHERE id = ?", [id]);

    return res.json({ message: "Registro deletado com sucesso!" });
  } catch (error) {
    console.error("Erro ao deletar arquivo:", error);
    return res.status(500).json({ error: "Erro ao deletar registro." });
  }
}

module.exports = {
  listarArquivos,
  criarArquivo,
  atualizarArquivo,
  deletarArquivo
};
