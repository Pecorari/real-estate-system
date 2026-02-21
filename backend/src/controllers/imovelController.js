const db = require('../config/db_connection');
const { createLog } = require("./logController");

async function listarImoveis(req, res) {
    try {
        const [rows] = await db.execute('SELECT * FROM imoveis ORDER BY id ASC');

        return res.json(rows);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Erro no servidor, ao listar imoveis' });
    }
};

async function getImoveisDisponiveisById(req, res) {
    try {
        const { clienteId } = req.params;

        const [rows] = await db.execute('SELECT * FROM imoveis WHERE cliente_id = ? AND status = ? ORDER BY id ASC', [clienteId, 'Disponivel']);

        return res.json(rows);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Erro no servidor, ao listar imoveis' });
    }
};

async function criarImovel(req, res) {
    try {
        const { cliente_id, tipo_imovel, descricao, cep, logradouro, numero, complemento, bairro, cidade, estado, area_m2, status } = req.body;
        
        if (!cliente_id || !tipo_imovel || !cep || !numero || !estado)
            return res.status(400).json({ error: 'Campos obrigatórios devem ser preenchido.' });

        const [result] = await db.execute('INSERT INTO imoveis (cliente_id, tipo_imovel, descricao, cep, logradouro, numero, complemento, bairro, cidade, estado, area_m2, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [cliente_id, tipo_imovel, descricao, cep, logradouro, numero, complemento, bairro, cidade, estado, area_m2, status]
        );

        await createLog({
            usuario_id: req.usuario.id,
            acao: "Criado um novo imovel",
            entidade: "imovel",
            entidade_id: result.insertId,
            descricao: `Adicionado novo imovel: ${result.insertId}`
        });
 
        return res.status(201).json({ id: result.insertId });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Erro no servidor, ao criar imovel' });
    }
};

async function atualizarImovel(req, res) {
    try {
        const { id } = req.params;
        const { cliente_id, tipo_imovel, descricao, cep, logradouro, numero, complemento, bairro, cidade, estado, area_m2, status } = req.body;

        if (!id) return res.status(400).json({ error: 'ID é obrigatório.' });
        if (!cliente_id || !tipo_imovel || !cep || !numero || !estado)
            return res.status(400).json({ error: 'Campos obrigatórios devem ser preenchido.' });

        const [result] = await db.execute('UPDATE imoveis SET cliente_id = ?, tipo_imovel = ?, descricao = ?, cep = ?, logradouro = ?, numero = ?, complemento = ?, bairro = ?, cidade = ?, estado = ?, area_m2 = ?, status = ? WHERE id = ?',
            [cliente_id, tipo_imovel, descricao, cep, logradouro, numero, complemento, bairro, cidade, estado, area_m2, status, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Imovel não encontrado.' });
        }

        await createLog({
            usuario_id: req.usuario.id,
            acao: "Atualizado um imovel",
            entidade: "imovel",
            entidade_id: id,
            descricao: `Atualizado o imovel: ${id}`
        });


        return res.json({ message: 'imovel atualizado com sucesso.' });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Erro no servidor, ao atualizar imovel' });
    }
};

async function deletarImovel(req, res) {
    try {
        const { id } = req.params;

        if (!id) return res.status(400).json({ error: 'ID é obrigatório.' });

        const [result] = await db.execute('DELETE FROM imoveis WHERE id = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Imovel não encontrado.' });
        }

        await createLog({
            usuario_id: req.usuario.id,
            acao: "Removido um imovel",
            entidade: "imovel",
            entidade_id: id,
            descricao: `Removido um imovel: ${id}`
        });

        return res.json({ message: 'imovel deletado com sucesso.' });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Erro no servidor, ao apagar imovel' });
    }
};

module.exports = {
    listarImoveis,
    getImoveisDisponiveisById,
    criarImovel,
    atualizarImovel,
    deletarImovel
}
