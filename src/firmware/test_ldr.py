# test_ldr.py - Teste individual do Sensor LDR
#
# PINO UTILIZADO: GPIO 34 (Entrada Analógica ADC1)
# Ligue a perna do sensor LDR com divisor de tensão no pino 34 do ESP32.

import time
import ldr

print("=========================================")
print("Iniciando Teste Individual do LDR")
print("Pino Conectado: GPIO 34 (ADC)")
print("=========================================")

# Inicializa o sensor LDR no pino 34
ldr_sensor = ldr.SensorLDR(pino_adc=34)

try:
    while True:
        valor_bruto = ldr_sensor.ler()
        porcentagem = ldr_sensor.porcentagem_luz()
        
        print("-----------------------------------------")
        print("Leitura do Sensor LDR:")
        print("  - Valor Bruto (ADC 12-bits):", valor_bruto)
        print("  - Luminosidade Calculada  :", porcentagem, "%")
        
        time.sleep(1.0)

except KeyboardInterrupt:
    print("\nTeste de LDR interrompido pelo usuário.")
