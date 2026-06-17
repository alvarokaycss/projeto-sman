from time import sleep
import ldr

# Instancia o sensor LDR (pino ADC padrão 34)
ldr_sensor = ldr.SensorLDR()

while True:
    valor_bruto = ldr_sensor.ler()
    porcentagem = ldr_sensor.porcentagem_luz()

    print("----------------")
    print("Valor ADC:", valor_bruto)
    print("Luminosidade:", porcentagem, "%")

    sleep(1)
