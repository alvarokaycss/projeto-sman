# test_aht21.py - Teste individual do Sensor AHT21 (Temperatura e Umidade)
#
# PINOS UTILIZADOS:
#   - SDA: GPIO 21
#   - SCL: GPIO 22
#   - Endereço: 0x38
#
# Script de leitura direta I2C sem dependência de drivers externos.

from machine import I2C, Pin
import time

# 1. Inicializa o barramento I2C oficial do ESP32 (GPIO 22 e 21)
# Frequência de 100kHz garante máxima estabilidade para o AHT21
i2c = I2C(0, scl=Pin(22), sda=Pin(21), freq=100000)

# Endereço I2C de fábrica do AHT21
AHT21_ADDR = 0x38

def inicializar_aht21():
    try:
        # Envia o comando de calibração/inicialização exigido pelo datasheet (0xBE)
        i2c.writeto(AHT21_ADDR, b'\xbe\x08\x00')
        time.sleep_ms(50)
        print("✅ Sensor AHT21 (Clima) Inicializado com Sucesso!")
    except Exception as e:
        print("❌ Erro crítico ao se comunicar com o AHT21:", e)

def ler_aht21():
    try:
        # 1. Envia o comando de gatilho para iniciar a medição (0xAC)
        i2c.writeto(AHT21_ADDR, b'\xac\x33\x00')
        time.sleep_ms(80) # Aguarda o tempo de conversão física do sensor
        
        # 2. Lê os 6 bytes de resposta retornados pelo sensor
        dados = i2c.readfrom(AHT21_ADDR, 6)
        
        # 3. Reconstrói os dados brutos de 20 bits usando sua indexação de array corrigida
        u_bruta = ((dados[1] << 12) | (dados[2] << 4) | (dados[3] >> 4))
        t_bruta = (((dados[3] & 0x0f) << 16) | (dados[4] << 8) | dados[5])
        
        # 4. Aplica as fórmulas matemáticas oficiais do fabricante
        temp = (t_bruta / 1048576.0) * 200.0 - 50.0
        umid = (u_bruta / 1048576.0) * 100.0
        
        return temp, umid
    except Exception as e:
        print("Erro durante a leitura dos dados:", e)
        return None, None

# Execução Principal
print("-" * 50)
inicializar_aht21()
print("🎙️ Iniciando monitoramento climático... Pressione Ctrl+C para parar.")
print("-" * 50)

try:
    while True:
        # Realiza a leitura física
        temperatura, umidade = ler_aht21()
        
        if temperatura is not None:
            # Exibe os dados formatados com uma casa decimal no console
            print(f"🌡️ Temperatura: {temperatura:.1f} °C  |  💧 Umidade: {umidade:.1f} %")
        
        # Aguarda 2 segundos antes da próxima medição (tempo ideal para não estressar o chip)
        time.sleep(2)

except KeyboardInterrupt:
    print("\n🛑 Monitoramento encerrado pelo usuário.")
