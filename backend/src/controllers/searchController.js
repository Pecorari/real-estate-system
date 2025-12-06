const connection = require('../config/db_connection');

const searchClientes = async (req, res) => {
  try {
    const { q, id, nome, cpf_cnpj, tipo } = req.query;

    let query = `
      SELECT c.*, 
      COUNT(a.id) AS total_arquivos
      FROM clientes c
      LEFT JOIN arquivos a 
        ON (a.cliente_locador_id = c.id OR a.cliente_locatario_id = c.id)
      WHERE 1 = 1
    `;
    const params = [];

    if (q && q.trim() !== "") {
      const likeQ = `%${q.trim()}%`;
      query += ` AND (
        c.id LIKE ?
        OR c.nome LIKE ?
        OR c.cpf_cnpj LIKE ?
      )`;
      params.push(likeQ, likeQ, likeQ);
    } else {

      if (id) {
        query += ` AND c.id LIKE ?`;
        params.push(`%${id}%`);
      }

      if (nome) {
        query += ` AND c.nome LIKE ?`;
        params.push(`%${nome}%`);
      }

      if (cpf_cnpj) {
        query += ` AND c.cpf_cnpj LIKE ?`;
        params.push(`%${cpf_cnpj}%`);
      }
    }

    if (tipo) {
      query += ` AND c.tipo LIKE ? OR c.tipo = 'ambos'`;
      params.push(`%${tipo}%`);
    }

    query += ` GROUP BY c.id`;
    query += ` ORDER BY id DESC`;

    const [rows] = await connection.execute(query, params);

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao realizar pesquisa avançada de clientes" });
  }
};

const searchArquivos = async (req, res) => {
  try {
    const { q, id, locador, locatario, data_ini, data_fim, status } = req.query;

    let query = `
      SELECT 
        a.*,
        c1.nome AS locador_nome,
        c2.nome AS locatario_nome
      FROM arquivos a
      LEFT JOIN clientes c1 ON c1.id = a.cliente_locador_id
      LEFT JOIN clientes c2 ON c2.id = a.cliente_locatario_id
      WHERE 1 = 1
    `;
    const params = [];

    if (q && q.trim() !== "") {
      const likeQ = `%${q.trim()}%`;
      query += ` AND (
        a.id LIKE ?
        OR c1.nome LIKE ?
        OR c2.nome LIKE ?
      )`;
      params.push(likeQ, likeQ, likeQ);

    } else {
      if (id) {
        query += ` AND a.id LIKE ?`;
        params.push(`%${id}%`);
      }

      if (locador) {
        query += ` AND c1.nome = ?`;
        params.push(locador);
      }

      if (locatario) {
        query += ` AND c2.nome = ?`;
        params.push(locatario);
      }
    }
    
    if (data_ini) {
      query += ` AND a.data_inicio >= ?`;
      params.push(data_ini);
    }

    if (data_fim) {
      query += ` AND a.data_fim <= ?`;
      params.push(data_fim);
    }

    if (status) {
      query += ` AND a.status = ?`;
      params.push(status);
    }

    query += ` ORDER BY id DESC`;

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
