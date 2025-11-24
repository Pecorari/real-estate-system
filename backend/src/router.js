const express = require('express');

const authController = require('./controllers/authController');
const usuarioController = require('./controllers/usuarioController');
const clienteController = require('./controllers/clienteController');
const arquivoController = require('./controllers/arquivoController');
const documentoController = require('./controllers/documentoController');
const searchController = require('./controllers/searchController');
const logController = require('./controllers/logController');

const { isAuth, isAdmin } = require('./middlewares/authMiddleware');

const router = express.Router();

// Autenticaçao
router.post('/auth/login', authController.login);
router.post('/auth/logout', authController.logout);
router.get('/auth/me', isAuth, authController.me);

// Usuarios (admin only)
router.get('/usuarios', isAuth, isAdmin, usuarioController.listarUsuarios);
router.post('/usuarios', isAuth, isAdmin, usuarioController.criarUsuario);
router.put('/usuarios/:id', isAuth, isAdmin, usuarioController.atualizarUsuario);
router.delete('/usuarios/:id', isAuth, isAdmin, usuarioController.deletarUsuario);

// Clientes
router.get('/clientes', clienteController);
router.post('/clientes', clienteController);
router.put('/clientes/:id', clienteController);
router.delete('/clientes/:id', clienteController);

// Arquivos
router.get('/arquivos', arquivoController);
router.post('/arquivos', arquivoController);
router.put('/arquivos/:id', arquivoController);
router.delete('/arquivos/:id', arquivoController);

// Documentos
// UPLOAD
router.post('/arquivos/:id/documentos', documentoController);
// LISTAGEM
router.get('/arquivos/:id/documentos', documentoController);
// DOWNLOAD
router.get('/arquivos/:id/documentos/:docId/download', documentoController);
// DELETE
router.delete('/arquivos/:id/documentos', documentoController);

// Pesquisa avançada
router.get('/search/clientes', searchController);
router.get('/search/arquivos', searchController);

// Logs
router.get('/logs', logController)
router.get('/logs?usuario_id', logController)
router.get('/logs?acao', logController)
router.get('/logs?arquivo&entidade_id', logController)

module.exports = router;
