// src/frontend/src/SensorSchema.js

// Configuração padrão do Gauge Geral (Score)
export const generalMediaConfig = {
  currentValue: 100,
  min: 0,
  max: 100,
  label: "SCORE GERAL",
  symbol: "%",
};

// Nosso "Schema" visual dos sensores da interface (metadados de cores, nomes e limites iniciais)
export const linesConfig = [
  {
    dataKey: "temperatura",
    label: "Temperatura",
    color: "#ff4d4d",
    min: 15,
    max: 40,
    symbol: "C°",
    currentValue: 0,
  },
  {
    dataKey: "umidade",
    label: "Umidade",
    color: "#3b82f6",
    min: 20,
    max: 90,
    symbol: "%",
    currentValue: 0,
  },
  {
    dataKey: "co2",
    label: "CO₂",
    color: "#52ff58",
    min: 400,
    max: 1500,
    symbol: "ppm",
    currentValue: 0,
  },
  {
    dataKey: "ruido",
    label: "Ruído",
    color: "#e7ff30",
    min: 30,
    max: 100,
    symbol: "dB",
    currentValue: 0,
  },
  {
    // Substituído: Pressão foi alterada para AQI
    dataKey: "aqi",
    label: "Qualidade do Ar (AQI)",
    color: "#0bc0f2", 
    min: 1,
    max: 5,
    symbol: "",
    currentValue: 1, // Escala AQI do ENS160 vai de 1 (Excelente) a 5 (Péssimo)
  },
  {
    dataKey: "luminosidade",
    label: "Luminosidade",
    color: "#e51b54",
    min: 0,
    max: 100,
    symbol: "%",
    currentValue: 0,
  },
];
