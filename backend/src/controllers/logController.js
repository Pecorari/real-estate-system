const connection = require("../config/db_connection");

const listarLogs = async (req, res) => {
  try {
    const { usuario_id, acao, entidade, entidade_id, data_ini, data_fim } = req.query;

    let query = `
      SELECT 
        l.*,
        u.nome AS usuario_nome
      FROM logs l
      LEFT JOIN usuarios u ON u.id = l.usuario_id
      WHERE 1 = 1
    `;

    const params = [];

    if (usuario_id) {
      query += ` AND l.usuario_id = ?`;
      params.push(usuario_id);
    }

    if (acao) {
      query += ` AND l.acao LIKE ?`;
      params.push(`%${acao}%`);
    }

    if (entidade) {
      query += ` AND l.entidade = ?`;
      params.push(entidade);
    }

    if (entidade_id) {
      query += ` AND l.entidade_id = ?`;
      params.push(entidade_id);
    }

    if (data_ini) {
      query += ` AND l.created_at >= ?`;
      params.push(data_ini + ' 00:00:00');
    }

    if (data_fim) {
      query += ` AND l.created_at <= ?`;
      params.push(data_fim + ' 23:59:59');
    }

    query += ` ORDER BY l.created_at DESC`;

    const [rows] = await connection.execute(query, params);

    res.json(rows);
  } catch (err) {
    console.error("Erro ao buscar logs:", err);
    res.status(500).json({ error: "Erro ao buscar logs" });
  }
};

async function createLog({ usuario_id, acao, entidade, entidade_id, descricao }) {
  try {
    await connection.execute(`INSERT INTO logs (usuario_id, acao, entidade, entidade_id, descricao) VALUES (?, ?, ?, ?, ?)`,
      [usuario_id, acao, entidade, entidade_id, descricao || null]
    );
  } catch (err) {
    console.error("Erro ao registrar log:", err);
  }
}

module.exports = {
    listarLogs,
    createLog
};
