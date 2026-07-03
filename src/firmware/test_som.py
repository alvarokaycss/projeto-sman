# test_som.py - Teste individual do Microfone Digital INMP441 (I2S)
#
# PINOS UTILIZADOS PARA O INMP441:
#   - SCK (Serial Clock): GPIO 14
#   - WS (Word Select / LRCLK): GPIO 15
#   - SD (Serial Data): GPIO 32
#   - L/R (Left/Right Channel Select): Conectar ao GND (canal esquerdo/mono)
#   - VDD: Conectar ao 3.3V do ESP32
#   - GND: Conectar ao GND do ESP32

import time
import math
import struct
from machine import Pin, I2S

print("=========================================")
print("Iniciando Teste Individual do Microfone I2S")
print("Pinos Conectados:")
print("  - SCK -> GPIO 14")
print("  - WS  -> GPIO 15")
print("  - SD  -> GPIO 32")
print("=========================================")

# 1. Configuração do barramento I2S para o microfone
# Usamos a interface I2S ID 0. Mono, 16kHz de taxa de amostragem.
try:
    i2s = I2S(
        0,
        sck=Pin(14),
        ws=Pin(15),
        sd=Pin(32),
        mode=I2S.RECEIVER,
        bits=32,          # O INMP441 envia 24 bits empacotados em palavras de 32 bits
        format=I2S.MONO,  # Mono (L/R conectado ao GND)
        rate=16000,       # Taxa padrão de áudio 16kHz
        ibuf=2048         # Buffer interno de leitura
    )
    print("[I2S] Interface I2S inicializada com sucesso.")
except Exception as e:
    print("[ERROR I2S] Falha ao inicializar a interface I2S:", e)
    i2s = None

# Buffer para armazenar as amostras brutas (cada amostra tem 4 bytes devido aos 32 bits)
# Vamos ler 256 amostras de cada vez (1024 bytes)
buffer = bytearray(1024)

print("\nIniciando leitura de intensidade sonora (pressione Ctrl+C para parar)...")
try:
    while i2s:
        # Lê os dados de áudio do microfone para o buffer
        n_bytes = i2s.readinto(buffer)
        
        if n_bytes > 0:
            # Desempacota as amostras brutas como inteiros de 32 bits assinados ('i')
            # n_bytes // 4 é a quantidade de inteiros no buffer
            quantidade_amostras = n_bytes // 4
            amostras = struct.unpack('<%di' % quantidade_amostras, buffer[:n_bytes])
            
            # Processamento digital de sinal: Cálculo de RMS (Root Mean Square)
            soma_quadrados = 0.0
            for amostra in amostras:
                # Normaliza o valor para a faixa de -1.0 a 1.0 (amostras de 32 bits)
                valor_normalizado = amostra / 2147483648.0
                soma_quadrados += valor_normalizado * valor_normalizado
            
            # Calcula a média dos quadrados e tira a raiz
            media_quadrados = soma_quadrados / quantidade_amostras
            rms = math.sqrt(media_quadrados)
            
            # Conversão para decibéis relativos (escala logarítmica)
            # Usando uma referência de silêncio de 0.00002 RMS para calibrar a leitura
            if rms > 0.0:
                decibeis_relativos = 20.0 * math.log10(rms / 0.00002)
            else:
                decibeis_relativos = 0.0
                
            # Limita a escala entre 30 dB (silêncio absoluto) e 110 dB (ruído extremo)
            decibeis_relativos = max(30.0, min(110.0, decibeis_relativos))
            
            # Desenha uma barra gráfica simples no console para vizualizar a variação de som
            tamanho_barra = int((decibeis_relativos - 30) / 2)
            barra = "#" * tamanho_barra + "-" * (40 - tamanho_barra)
            
            print("RMS: %f | Nível de Ruído: %6.2f dB | [%s]" % (rms, decibeis_relativos, barra))
            
        time.sleep(0.2) # Atualiza a leitura rapidamente para ver as variações

except KeyboardInterrupt:
    print("\nTeste de som interrompido pelo usuário.")
finally:
    if i2s:
        i2s.deinit()
        print("[I2S] Interface I2S encerrada.")
