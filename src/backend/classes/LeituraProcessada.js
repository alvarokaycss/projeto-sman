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
                mensagem: 'Temperatura acima do limite de conforto!'
            });
        }
        if (configsSala.temp_min && tempAtual < configsSala.temp_min) {
            this.alerta.ativo = true;
            this.alerta.gatilhos.push({
                parametro: 'Temperatura',
                valor: tempAtual,
                limite: configsSala.temp_min,
                mensagem: 'Temperatura abaixo do limite de conforto!'
            });
        }

        // Validação de Ruído (INMP441)
        if (configsSala.som_max && somAtual > configsSala.som_max) {
            this.alerta.ativo = true;
            this.alerta.gatilhos.push({
                parametro: 'Som',
                valor: somAtual,
                limite: configsSala.som_max,
                mensagem: 'Nível de som alto (Risco de sobrecarga sensorial)!'
            });
        }

        // Validação de Gases (ENS160)
        if (configsSala.eco2_max && eco2Atual > configsSala.eco2_max) {
            this.alerta.ativo = true;
            this.alerta.gatilhos.push({
                parametro: 'Eco2',
                valor: eco2Atual,
                limite: configsSala.eco2_max,
                mensagem: 'Nível de CO2 elevado! Necessário ventilar o ambiente.'
            });
        }

        // Validação de Umidade
        if (configsSala.umid_max && umidAtual > configsSala.umid_max) {
            this.alerta.ativo = true;
            this.alerta.gatilhos.push({
                parametro: 'Umidade',
                valor: umidAtual,
                limite: configsSala.umid_max,
                mensagem: 'Umidade acima do limite ideal!'
            });
        }

        // Validação de Luminosidade
        if (configsSala.luminosidade_max && luzAtual > configsSala.luminosidade_max) {
            this.alerta.ativo = true;
            this.alerta.gatilhos.push({
                parametro: 'Luminosidade',
                valor: luzAtual,
                limite: configsSala.luminosidade_max,
                mensagem: 'Ambiente excessivamente claro / Ofuscamento visual!'
            });
        }
    }
}

module.exports = LeituraProcessada;