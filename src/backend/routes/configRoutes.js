const express = require('express');
const router = express.Router();
const configController = require('../controllers/configController');

// Rota para Buscar Configuração por MAC address
router.get('/config/:mac_address', configController.getConfigByMac);
// Rota para Salvar Nova Configuração
router.post('/config', configController.saveNewConfig);

module.exports = router;