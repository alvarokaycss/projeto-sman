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
    const { mac_address, temp_max, temp_min, umid_max, umid_min, eco2_max, tvoc_max, luminosidade_max, luminosidade_min, som_max } = req.body;

    if (!mac_address) {
        return res.status(400).json({ error: 'MAC address é obrigatório!' });
    }

    try {
        const queryDevice = `SELECT id FROM dispositivos WHERE mac_address = $1`;
        const result = await pgDB.query(queryDevice, [mac_address]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Dispositivo não encontrado!' });
        }

        const dispositivo_id = result.rows[0].id;

        const queryInsert = `
        INSERT INTO configuracao_alertas (
                dispositivo_id, temp_max, temp_min, umid_max, umid_min, 
                eco2_max, tvoc_max, luminosidade_max, luminosidade_min, som_max, atualizado_em
            ) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
            ON CONFLICT (dispositivo_id) 
            DO UPDATE SET
                temp_max = COALESCE(EXCLUDED.temp_max, configuracao_alertas.temp_max),
                temp_min = COALESCE(EXCLUDED.temp_min, configuracao_alertas.temp_min),
                umid_max = COALESCE(EXCLUDED.umid_max, configuracao_alertas.umid_max),
                umid_min = COALESCE(EXCLUDED.umid_min, configuracao_alertas.umid_min),
                eco2_max = COALESCE(EXCLUDED.eco2_max, configuracao_alertas.eco2_max),
                tvoc_max = COALESCE(EXCLUDED.tvoc_max, configuracao_alertas.tvoc_max),
                luminosidade_max = COALESCE(EXCLUDED.luminosidade_max, configuracao_alertas.luminosidade_max),
                luminosidade_min = COALESCE(EXCLUDED.luminosidade_min, configuracao_alertas.luminosidade_min),
                som_max = COALESCE(EXCLUDED.som_max, configuracao_alertas.som_max),
                atualizado_em = NOW()
            RETURNING *;
        `;

        const values = [
            dispositivo_id,
            temp_max ?? null, temp_min ?? null,
            umid_max ?? null, umid_min ?? null,
            eco2_max ?? null, tvoc_max ?? null,
            luminosidade_max ?? null, luminosidade_min ?? null,
            som_max ?? null
        ];

        const insertResult = await pgDB.query(queryInsert, values);
        
        return res.status(200).json({ message: 'Configuração salva com sucesso!', config: insertResult.rows[0] });

    } catch (error) {
        console.error('Erro ao salvar nova configuração:', error);
        res.status(500).json({ error: 'Erro ao salvar configuração' });
    }
}

module.exports = {
    getConfigByMac,
    saveNewConfig
};