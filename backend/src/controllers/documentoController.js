const connection = require('../config/db_connection');
const { bucket } = require("../config/firebase");
const { createLog } = require("./logController");
const path = require("path");

const uploadDocumento = async (req, res) => {
  try {
    const arquivoId = req.params.id;
    const { tipo_documento_id } = req.body;

    if (!req.file) return res.status(400).json({ error: "Nenhum arquivo enviado." });
    if (!tipo_documento_id) return res.status(400).json({ error: "tipo_documento_id é obrigatório." });

    const [result] = await connection.execute(`INSERT INTO documentos (arquivo_id, tipo_documento_id, nome_original) VALUES (?, ?, ?)`,
      [arquivoId, tipo_documento_id, req.file.originalname]
    );

    const documentoId = result.insertId;

    const ext = path.extname(req.file.originalname);
    const base = path.basename(req.file.originalname, ext).replace(/[^\w.-]/g, "_");
    const nomeArquivo = `${base}-${Date.now()}${ext}`;

    const firebasePath = `arquivos/${arquivoId}/documentos/${documentoId}/${nomeArquivo}`;

    await bucket.file(firebasePath).save(req.file.buffer, {
      metadata: { contentType: req.file.mimetype }
    });

    await connection.execute(`UPDATE documentos SET nome = ?, caminho = ? WHERE id = ?`,
      [nomeArquivo, firebasePath, documentoId]
    );

    await createLog({
      usuario_id: req.usuario.id,
      acao: "Adicionado um documento",
      entidade: "documento",
      entidade_id: documentoId,
      descricao: `Documento ${documentoId} feito upload`
    });

    res.status(201).json({ message: "Documento enviado com sucesso!", documento_id: documentoId });
  } catch (error) {
    console.error("Erro no upload:", error);
    res.status(500).json({ error: "Erro ao fazer upload do documento" });
  }
};

const listarDocumentos = async (req, res) => {
    try {
        const arquivoId = req.params.id;

        const [docs] = await connection.execute(`SELECT * FROM documentos WHERE arquivo_id = ? ORDER BY created_at DESC`, [arquivoId]);

        return res.status(200).json(docs);
    } catch (error) {
        console.error("Erro ao listar documentos:", error);
        return res.status(500).json({ error: "Erro ao listar documentos" });
    }
}

const downloadDocumento = async (req, res) => {
    try {
        const arquivoId = req.params.id;
        const docId = req.params.docId;
        const [[doc]] = await connection.execute(`SELECT * FROM documentos WHERE id = ? AND arquivo_id = ?`, [docId, arquivoId]);
        
        if (!doc) return res.status(404).json({ error: "Documento não encontrado." });
        
        const file = bucket.file(doc.caminho);

        const [url] = await file.getSignedUrl({
            action: "read",
            expires: Date.now() + 1000 * 60 * 10
        });

        await createLog({
            usuario_id: req.usuario.id,
            acao: "Feito download de um documento",
            entidade: "documento",
            entidade_id: docId,
            descricao: `Download de um documento: ${docId}`
        });
        
        return res.json({ url });
    } catch (error) {
        console.error("Erro ao fazer download do documento:", error);
        return res.status(500).json({ error: "Erro ao fazer download do documento" });
    }
}

const deletarDocumento = async (req, res) => {
    try {
        const arquivoId = req.params.id;
        const docId = req.params.docId;

        if (!docId) return res.status(400).json({ error: "docId é obrigatório." });

        const [[doc]] = await connection.execute(`SELECT * FROM documentos WHERE id = ? AND arquivo_id = ?`, [docId, arquivoId]);

        if (!doc) return res.status(404).json({ error: "Documento não encontrado." });

        await connection.execute(`DELETE FROM documentos WHERE id = ?`, [docId]);

        await bucket.file(doc.caminho).delete();

        await createLog({
            usuario_id: req.usuario.id,
            acao: "Removido um documento",
            entidade: "documento",
            entidade_id: docId,
            descricao: `Deletado um documento: ${docId}`
        });

        return res.status(200).json({ message: "Documento excluído com sucesso." });
    } catch (error) {
        console.error("Erro ao deletar documento:", error);
        return res.status(500).json({ error: "Erro ao deletar documento" });
    }
};

module.exports = {
    uploadDocumento,
    listarDocumentos,
    downloadDocumento,
    deletarDocumento
}
