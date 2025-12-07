const db = require('../config/db_connection');

async function listarTipoDocumentos(req, res) {
    try {
        const [rows] = await db.execute('SELECT id, nome FROM tipo_documentos ORDER BY id ASC');

        return res.json(rows);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Erro no servidor.' });
    }
};

async function criarTipoDocumento(req, res) {
    try {
        const { nome } = req.body;

        if (!nome || nome.trim() === '') return res.status(400).json({ error: 'O campo "nome" é obrigatório.' });

        const [result] = await db.execute('INSERT INTO tipo_documentos (nome) VALUES (?)', [nome.trim()]);

        return res.status(201).json({ id: result.insertId, nome: nome.trim() });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Erro no servidor.' });
    }
};

async function atualizarTipoDocumento(req, res) {
    try {
        const { id } = req.params;
        const { nome } = req.body;

        if (!id) return res.status(400).json({ error: 'ID é obrigatório.' });

        if (!nome || nome.trim() === '') return res.status(400).json({ error: 'O campo "nome" é obrigatório.' });

        const [result] = await db.execute('UPDATE tipo_documentos SET nome = ? WHERE id = ?', [nome.trim(), id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Tipo de documento não encontrado.' });
        }

        return res.json({ message: 'Tipo de documento atualizado com sucesso.' });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Erro no servidor.' });
    }
};

async function apagarTipoDocumento(req, res) {
    try {
        const { id } = req.params;

        if (!id) return res.status(400).json({ error: 'ID é obrigatório.' });

        const [result] = await db.execute('DELETE FROM tipo_documentos WHERE id = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Tipo de documento não encontrado.' });
        }

        return res.json({ message: 'Tipo de documento deletado com sucesso.' });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Erro no servidor.' });
    }
};

module.exports = {
    listarTipoDocumentos,
    criarTipoDocumento,
    atualizarTipoDocumento,
    apagarTipoDocumento
}
