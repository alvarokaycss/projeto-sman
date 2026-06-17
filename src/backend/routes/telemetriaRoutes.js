const express = require('express');
const router = express.Router();
const Leitura = require('../models/Leitura_ambiente');

// Rota temporária para simular a inserção de uma leitura ambiental (POST)
router.post('/telemetria/mock', async (req, res) => {
    try {
        const novaLeitura = new Leitura(req.body);
        const leituraSalva = await novaLeitura.save();
        
        return res.status(201).json({
            message: "Telemetria guardada com sucesso no MongoDB!",
            dados: leituraSalva
        });
    } catch (error) {
        console.error("Erro ao guardar telemetria no Mongo:", error.message);
        return res.status(400).json({ error: "Erro de validação nos dados do sensor.", detalhes: error.message });
    }
});

module.exports = router;