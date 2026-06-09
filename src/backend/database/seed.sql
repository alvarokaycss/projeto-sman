-- População inicial de testes (Seed)
-- Regista a ESP32 de teste e atrela os limites padrão a ela

INSERT INTO dispositivos (mac_address, nome_sala, localizacao, status_dispositivo)
VALUES ('b4:bf:e9:0e:0c:08', 'Laboratório de Redes - IFPE', 'Bloco A, Sala 4', 'online')
ON CONFLICT (mac_address) DO NOTHING;

-- Garante que a configuração de alertas é vinculada ao ID do dispositivo inserido
INSERT INTO configuracao_alertas (dispositivo_id)
SELECT id FROM dispositivos WHERE mac_address = 'b4:bf:e9:0e:0c:08'
ON CONFLICT (dispositivo_id) DO NOTHING;