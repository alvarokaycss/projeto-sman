class LeituraProcessada {
    /**
     * @param {Object} payloadRaw - O JSON bruto vindo do simulador MQTT
     * @param {Object} configsSala - A linha retornada do PostgreSQL com os limites
     */
    constructor(payloadRaw, configsSala) {
        this.mac_address = payloadRaw.mac_address;
        this.timestamp = payloadRaw.timestamp ? new Date(payloadRaw.timestamp) : new Date();
        this.sala = configsSala.nome_sala

        this.metricas = {
            clima: payloadRaw.metricas.clima,
            qualidade_ar: payloadRaw.metricas.qualidade_ar,
            luminosidade: payloadRaw.metricas.luminosidade,
            som: payloadRaw.metricas.som
        };

        this.alerta = {
            ativo: false,
            gatilhos: []
        }
    }

/**
     * Método Encapsulado: Aplica as condicionantes do RF010
     * @param {Object} configsSala - Limites vindos do banco relacional
     */
    validarLimites(configsSala) {
        const tempAtual = this.metricas.clima.temperatura;
        const somAtual = this.metricas.som.decibeis;
        const eco2Atual = this.metricas.qualidade_ar.eco2;
        const umidAtual = this.metricas.clima.umidade;
        const tvocAtual = this.metricas.qualidade_ar.tvoc;
        const luzAtual = this.metricas.luminosidade.porcentagem;

        // Validação de Temperatura Máxima e Mínima
        if (configsSala.temp_max && tempAtual > configsSala.temp_max) {
            this.alerta.ativo = true;
            this.alerta.gatilhos.push({
                parametro: 'Temperatura',
                valor: tempAtual,
                limite: configsSala.temp_max,
                mensagem: 'Temperatura acima da faixa recomendada. Ajuste a climatização do ambiente ou aumente a ventilação natural, quando possível.'
            });
        }
        if (configsSala.temp_min && tempAtual < configsSala.temp_min) {
            this.alerta.ativo = true;
            this.alerta.gatilhos.push({
                parametro: 'Temperatura',
                valor: tempAtual,
                limite: configsSala.temp_min,
                mensagem: 'Temperatura abaixo da faixa recomendada. Ajuste a climatização para manter uma condição mais confortável.'
            });
        }

        // Validação de Ruído (INMP441)
        if (configsSala.som_max && somAtual > configsSala.som_max) {
            this.alerta.ativo = true;
            this.alerta.gatilhos.push({
                parametro: 'Som',
                valor: somAtual,
                limite: configsSala.som_max,
                mensagem: 'Recomendado reduzir as fontes de ruído e manter portas e janelas fechadas quando houver barulho externo.'
            });
        }

        // Validação de Gases (ENS160)
        if (configsSala.eco2_max && eco2Atual > configsSala.eco2_max) {
            this.alerta.ativo = true;
            this.alerta.gatilhos.push({
                parametro: 'Eco2',
                valor: eco2Atual,
                limite: configsSala.eco2_max,
                mensagem: 'Concentração de CO₂ elevada. Recomenda-se aumentar a circulação de ar abrindo portas ou janelas, ou utilizar ventilação mecânica adequada.'
            });
        }

        // Validação de Umidade
        if (configsSala.umid_max && umidAtual > configsSala.umid_max) {
            this.alerta.ativo = true;
            this.alerta.gatilhos.push({
                parametro: 'Umidade',
                valor: umidAtual,
                limite: configsSala.umid_max,
                mensagem: 'Umidade acima da faixa recomendada. Verifique a ventilação do ambiente e reduza fontes de umidade, quando possível.'
            });
        }
        
        if (configsSala.umid_min && umidAtual < configsSala.umid_min) {
            this.alerta.ativo = true;
            this.alerta.gatilhos.push({
                parametro: 'Umidade',
                valor: umidAtual,
                limite: configsSala.umid_min,
                mensagem: 'Umidade abaixo da faixa recomendada. Sempre que possível, aumente a ventilação adequada ou utilize um umidificador de ar.'
            });
        }

        // Validação de Luminosidade
        if (configsSala.luminosidade_max && luzAtual > configsSala.luminosidade_max) {
            this.alerta.ativo = true;
            this.alerta.gatilhos.push({
                parametro: 'Luminosidade',
                valor: luzAtual,
                limite: configsSala.luminosidade_max,
                mensagem: 'Iluminação acima da faixa recomendada. Reduza a intensidade da iluminação ou utilize cortinas e persianas para diminuir a incidência de luz.'
            });
        }
    }
}

module.exports = LeituraProcessada;