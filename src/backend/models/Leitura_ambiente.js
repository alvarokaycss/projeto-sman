const mongoose = require('mongoose');

const LeituraSchema = new mongoose.Schema({
    mac_address: {
        type: String,
        required: true,
        trim: true
    },
    timestamp: {
        type: Date,
        required: true,
        default: Date.now
    },
    metricas: {
        clima: {
            temperatura: { type: Number, required: true },
            umidade: { type: Number, required: true }
        },
        qualidade_ar: {
            eco2: { type: Number, required: true },
            tvoc: { type: Number, required: true },
            aqi: { type: Number, required: true }
        },
        luminosidade: {
            porcentagem: { type: Number, required: true }
        },
        som: {
            decibeis: { type: Number, required: true }
        }
    }
}, {
    // Evita a concorrência, toda leitura é única e imutável (novas leituras não atualizam as antigas)
    versionKey: false 
});

// Índice composto para otimizar consultas por mac_address e timestamp
LeituraSchema.index({ mac_address: 1, timestamp: -1 });

module.exports = mongoose.model('Leitura', LeituraSchema, 'leituras_ambientais');