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
    
    -- Limites Conforto Térmico (AHT21 / DHT21)
    temp_max DECIMAL(4,2) DEFAULT 26.00,
    temp_min DECIMAL(4,2) DEFAULT 18.00,
    umid_max DECIMAL(4,2) DEFAULT 65.00,
    umid_min DECIMAL(4,2) DEFAULT 35.00,
    
    -- Limites Qualidade do Ar (ENS160)
    eco2_max INT DEFAULT 1200,
    tvoc_max INT DEFAULT 250,
    
    -- Limites Luminosidade (LDR + Módulo)
    luminosidade_max DECIMAL(5,2) DEFAULT 85.00,
    luminosidade_min DECIMAL(5,2) DEFAULT 25.00,
    
    -- Limites Ruído Sonoro (INMP441)
    som_max DECIMAL(5,2) DEFAULT 65.00,
    
    atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices para otimização de busca em chaves estrangeiras e MAC Address
CREATE INDEX IF NOT EXISTS idx_dispositivos_mac ON dispositivos(mac_address);