const connection = require('../db');

const searchClientes = async (req, res) => {
  try {
    const { nome, cpf_cnpj, tipo } = req.query;

    let query = `
      SELECT c.*, 
      COUNT(a.id) AS total_arquivos
      FROM clientes c
      LEFT JOIN arquivos a ON a.cliente_id = c.id
      WHERE 1 = 1
    `;
    const params = [];

    if (nome) {
      query += ` AND c.nome LIKE ?`;
      params.push(`%${nome}%`);
    }

    if (cpf_cnpj) {
      query += ` AND c.cpf_cnpj = ?`;
      params.push(cpf_cnpj);
    }

    if (tipo) {
      query += ` AND c.tipo = ?`;
      params.push(`%${tipo}%`);
    }

    query += ` GROUP BY c.id`;

    const [rows] = await connection.execute(query, params);

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao realizar pesquisa avançada de clientes" });
  }
};

const searchArquivos = async (req, res) => {
  try {
    const { cliente_locador_id, cliente_locatario_id, data_ini, data_fim, status } = req.query;

    let query = `
      SELECT 
        a.*,
        c1.nome AS nome_locador,
        c2.nome AS nome_locatario
      FROM arquivos a
      LEFT JOIN clientes c1 ON c1.id = a.cliente_locador_id
      LEFT JOIN clientes c2 ON c2.id = a.cliente_locatario_id
      WHERE 1 = 1
    `;
    const params = [];

    if (cliente_locador_id) {
      query += ` AND a.cliente_locador_id = ?`;
      params.push(cliente_locador_id);
    }

    if (cliente_locatario_id) {
      query += ` AND a.cliente_locatario_id = ?`;
      params.push(cliente_locatario_id);
    }

    if (status) {
      query += ` AND a.status = ?`;
      params.push(status);
    }

    if (data_ini) {
      query += ` AND a.data_inicio >= ?`;
      params.push(data_ini);
    }

    if (data_fim) {
      query += ` AND a.data_fim <= ?`;
      params.push(data_fim);
    }

    const [rows] = await connection.execute(query, params);

    res.json(rows);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao realizar pesquisa avançada de arquivos" });
  }
};

module.exports = {
    searchClientes,
    searchArquivos
};
