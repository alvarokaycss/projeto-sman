-- V1__Estrutura_Inicial_SMAN.sql
-- Script de Inicialização e Versionamento do Esquema Relacional

-- 1. Criação da Tabela de Dispositivos (Salas físicas monitoradas)
CREATE TABLE IF NOT EXISTS dispositivos (
    id SERIAL PRIMARY KEY,
    mac_address VARCHAR(17) UNIQUE NOT NULL,
    nome_sala VARCHAR(100) NOT NULL,
    localizacao VARCHAR(150),
    status_dispositivo VARCHAR(20) DEFAULT 'online',
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Criação da Tabela de Limites de Alerta (Regras de Negócio - RF011)
CREATE TABLE IF NOT EXISTS configuracao_alertas (
    id SERIAL PRIMARY KEY,
    dispositivo_id INT UNIQUE REFERENCES dispositivos(id) ON DELETE CASCADE,

    -- Temperatura (°C)
    temp_max DECIMAL(4,2) DEFAULT 27.00,
    temp_min DECIMAL(4,2) DEFAULT 20.00,

    -- Umidade Relativa (%)
    umid_max DECIMAL(4,2) DEFAULT 65.00,
    umid_min DECIMAL(4,2) DEFAULT 40.00,

    -- Qualidade do Ar (ENS160)
    eco2_max INT DEFAULT 1000,
    tvoc_max INT DEFAULT 220,

    -- Luminosidade (% do sensor)
    luminosidade_max DECIMAL(5,2) DEFAULT 90.00,
    luminosidade_min DECIMAL(5,2) DEFAULT 20.00,

    -- Ruído (dB)
    som_max DECIMAL(5,2) DEFAULT 65.00,

    atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices para otimização de busca em chaves estrangeiras e MAC Address
CREATE INDEX IF NOT EXISTS idx_dispositivos_mac ON dispositivos(mac_address);