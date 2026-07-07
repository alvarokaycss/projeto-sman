const mqtt = require('mqtt');
const pgDb = require('../config/pgConfig');
const Leitura = require('../models/Leitura_ambiente');
const LeituraProcessada = require("../classes/LeituraProcessada");

const initMqttService = (io) => {
    const MQTT_BROKER = process.env.MQTT_BROKER || 'mqtt://localhost:1883';
    const client = mqtt.connect(MQTT_BROKER);

    client.on('connect', () => {
        console.log('MQTT: Conectado ao broker Mosquitto com sucesso!');

        client.subscribe('ambiente/+/telemetria', (err) => {
            if (err) {
                console.error(' Erro ao se inscrever no tópico [ambiente/+/telemetria]:', err);
            } else {
                console.log(' MQTT: Inscrito no tópico [ambiente/+/telemetria]');
            }
        });
    });

    client.on('message', async (topic, message) => {
        try {
            const payloadRaw = JSON.parse(message.toString());

            console.log("Recebida mensagem via MQTT do dispositivo:", payloadRaw.mac_address);

            const query = `
                SELECT d.nome_sala, c.temp_max, c.temp_min, c.umid_max, c.umid_min, 
                       c.som_max, c.eco2_max, c.tvoc_max, c.luminosidade_max, c.luminosidade_min 
                FROM dispositivos d
                LEFT JOIN configuracao_alertas c ON d.id = c.dispositivo_id 
                WHERE d.mac_address = $1
            `;

            const queryResult = await pgDb.query(query, [payloadRaw.mac_address]);

            if (queryResult.rows.length === 0) {
                console.error(' Dispositivo não encontrado para o mac_address:', mac_address);
                return;
            }

            const configsSala = queryResult.rows[0];
            const leituraDoAmbiente = new LeituraProcessada(payloadRaw, configsSala);
            leituraDoAmbiente.validarLimites(configsSala);
            const novaLeitura = new Leitura({
                mac_address: leituraDoAmbiente.mac_address,
                timestamp: leituraDoAmbiente.timestamp,
                metricas: leituraDoAmbiente.metricas,
                alerta: leituraDoAmbiente.alerta
            });

            await novaLeitura.save();
            console.log(`Telemetria da Sala [${leituraDoAmbiente.sala}]`)

            // RF004: Transmite os dados em tempo real via Socket.IO
            const payload = {
                mac_address: leituraDoAmbiente.mac_address,
                sala: leituraDoAmbiente.sala,
                timestamp: leituraDoAmbiente.timestamp,
                metricas: leituraDoAmbiente.metricas,
                alerta: leituraDoAmbiente.alerta
            };

            console.log('[ALERTA]', JSON.stringify(payload.alerta));

            io.emit('dashboard:geral', payload);
            io.emit(`dashboard:${payload.mac_address}`, payload);
            console.log(' Socket.IO: Dados transmitidos para os dashboards.');

        } catch (error) {
            console.error(' Erro no processamento da mensagem MQTT:', error.message);
        }
    });

    client.on('error', (err) => {
        console.log("Erro no cliente MQTT:", err.message);
    });

};

module.exports = initMqttService;