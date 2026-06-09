const pgDB = require("../config/pgConfig");

const getConfigByMac = async (req, res) => {
    const { mac_address } = req.params;
    try {
        const query = `
            SELECT
                d.mac_address, d.nome_sala, d.localizacao,
                c.temp_max, c.temp_min, c.umid_max, c.umid_min,
                c.eco2_max, c.tvoc_max, c.luminosidade_max, c.luminosidade_min,
                c.som_max
            FROM dispositivos d
            LEFT JOIN configuracao_alertas c ON d.id = c.dispositivo_id
            WHERE d.mac_address = $1
        `;

        const result = await pgDB.query(query, [mac_address]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Sala não encontrada!' });
        }

        return res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error('Erro ao buscar configuração por MAC address:', error);
        res.status(500).json({ error: 'Erro ao buscar configuração' });
    }
}

const saveNewConfig = async (req, res) => {
    res.status(503).json({ message: 'Serviço temporariamente indisponível' });
}

module.exports = {
    getConfigByMac,
    saveNewConfig
};