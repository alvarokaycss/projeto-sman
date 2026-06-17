const mqtt = require('mqtt');
const pgDb = require('../config/pgConfig');
const Leitura = require('../models/Leitura_ambiente');

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
            const { mac_address, metricas } = payloadRaw;

            console.log("Recebida mensagem via MQTT do dispositivo:", mac_address);

            const query = `
                SELECT d.nome_sala, c.temp_max, c.temp_min, c.umid_max, c.umid_min, 
                       c.som_max, c.eco2_max, c.tvoc_max, c.luminosidade_max, c.luminosidade_min 
                FROM dispositivos d
                LEFT JOIN configuracao_alertas c ON d.id = c.dispositivo_id 
                WHERE d.mac_address = $1
            `;

            const queryResult = await pgDb.query(query, [mac_address]);

            if (queryResult.rows.length === 0) {
                console.error(' Dispositivo não encontrado para o mac_address:', mac_address);
                return;
            }

            let nomeSala = 'Dispositivo Não Cadastrado';
            let alertasDisparados = [];
            let ambienteDesregulado = false;

            const configsSala = queryResult.rows[0];
            nomeSala = configsSala.nome_sala;

            // Mapeamento do sensores
            const tempAtual = metricas.clima.temperatura;
            const umidAtual = metricas.clima.umidade;
            const somAtual = metricas.som.decibeis;
            const eco2Atual = metricas.qualidade_ar.eco2;
            const tvocAtual = metricas.qualidade_ar.tvoc;
            const luzAtual = metricas.luminosidade.porcentagem;

            //  Validações de Temperatura
            const limiteTemperaturaExcedido = configsSala.temp_max && tempAtual > configsSala.temp_max;
            const limiteTemperaturaMinimaExcedido = configsSala.temp_min && tempAtual < configsSala.temp_min;

            //  Validações de Umidade
            const limiteUmidadeExcedido = configsSala.umid_max && umidAtual > configsSala.umid_max;
            const limiteUmidadeMinimaExcedido = configsSala.umid_min && umidAtual < configsSala.umid_min;

            //  Validação de Som
            const limiteSomExcedido = configsSala.som_max && somAtual > configsSala.som_max;

            //  Validações de Gases/Qualidade do Ar
            const limiteEco2Excedido = configsSala.eco2_max && eco2Atual > configsSala.eco2_max;
            const limiteTvocExcedido = configsSala.tvoc_max && tvocAtual > configsSala.tvoc_max;

            //  Validações de Luminosidade
            const limiteLuminosidadeExcedido = configsSala.luminosidade_max && luzAtual > configsSala.luminosidade_max;
            const limiteLuminosidadeMinimaExcedido = configsSala.luminosidade_min && luzAtual < configsSala.luminosidade_min;

            // --- ALIMENTAÇÃO DOS GATILHOS DE ALERTA ---
            if (limiteTemperaturaExcedido) {
                ambienteDesregulado = true;
                alertasDisparados.push({
                    parametro: 'Temperatura',
                    valor: tempAtual,
                    limite: configsSala.temp_max,
                    mensagem: `Temperatura acima do limite de conforto!`
                });
            }

            if (limiteTemperaturaMinimaExcedido) {
                ambienteDesregulado = true;
                alertasDisparados.push({
                    parametro: 'Temperatura',
                    valor: tempAtual,
                    limite: configsSala.temp_min,
                    mensagem: `Temperatura abaixo do limite de conforto!`
                });
            }

            if (limiteUmidadeExcedido) {
                ambienteDesregulado = true;
                alertasDisparados.push({
                    parametro: 'Umidade',
                    valor: umidAtual,
                    limite: configsSala.umid_max,
                    mensagem: `Umidade acima do limite ideal!`
                });
            }

            if (limiteUmidadeMinimaExcedido) {
                ambienteDesregulado = true;
                alertasDisparados.push({
                    parametro: 'Umidade',
                    valor: umidAtual,
                    limite: configsSala.umid_min,
                    mensagem: `Umidade abaixo do limite ideal!`
                });
            }

            if (limiteSomExcedido) {
                ambienteDesregulado = true;
                alertasDisparados.push({
                    parametro: 'Som',
                    valor: somAtual,
                    limite: configsSala.som_max,
                    mensagem: `Nível de som alto (Risco de sobrecarga sensorial)!`
                });
            }

            if (limiteEco2Excedido) {
                ambienteDesregulado = true;
                alertasDisparados.push({
                    parametro: 'Eco2',
                    valor: eco2Atual,
                    limite: configsSala.eco2_max,
                    mensagem: `Nível de CO2 elevado! Necessário ventilar o ambiente.`
                });
            }

            if (limiteTvocExcedido) {
                ambienteDesregulado = true;
                alertasDisparados.push({
                    parametro: 'Tvoc',
                    valor: tvocAtual,
                    limite: configsSala.tvoc_max,
                    mensagem: `Nível de poluentes voláteis (TVOC) elevado!`
                });
            }

            if (limiteLuminosidadeExcedido) {
                ambienteDesregulado = true;
                alertasDisparados.push({
                    parametro: 'Luminosidade',
                    valor: luzAtual,
                    limite: configsSala.luminosidade_max,
                    mensagem: `Ambiente excessivamente claro / Ofuscamento visual!`
                });
            }

            if (limiteLuminosidadeMinimaExcedido) {
                ambienteDesregulado = true;
                alertasDisparados.push({
                    parametro: 'Luminosidade',
                    valor: luzAtual,
                    limite: configsSala.luminosidade_min,
                    mensagem: `Ambiente muito escuro para a atividade!`
                });
            }

            const payLoadEnriquecido = {
                ...payloadRaw,
                sala: nomeSala,
                alerta: {
                    ativo: ambienteDesregulado,
                    gatilhos: alertasDisparados
                }
            };

            // Salvamento histórico no MongoDB
            const novaLeitura = new Leitura({
                mac_address,
                timestamp: payloadRaw.timestamp ? new Date(payloadRaw.timestamp) : new Date(),
                metricas: metricas
            });

            await novaLeitura.save();
            console.log(` MongoDB: Telemetria salva no banco histórico.`);

            // RF004: Transmite os dados em tempo real via Socket.IO
            io.emit('dashboard:geral', payLoadEnriquecido);
            io.emit(`dashboard:${mac_address}`, payLoadEnriquecido);
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