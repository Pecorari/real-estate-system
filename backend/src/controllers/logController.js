const connection = require("../db/connection");

const logController = async (req, res) => {
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

    // FILTROS

    if (usuario_id) {
      query += ` AND l.usuario_id = ?`;
      params.push(usuario_id);
    }

    if (acao) {
      query += ` AND l.acao = ?`;
      params.push(acao);
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
      params.push(data_ini);
    }

    if (data_fim) {
      query += ` AND l.created_at <= ?`;
      params.push(data_fim);
    }

    query += ` ORDER BY l.created_at DESC`;

    const [rows] = await connection.execute(query, params);

    res.json(rows);
  } catch (err) {
    console.error("Erro ao buscar logs:", err);
    res.status(500).json({ error: "Erro ao buscar logs" });
  }
};

module.exports = {
    logController
};
