from machine import Pin, ADC


class SensorLDR:
    def __init__(self, pino_adc=34):
        self.adc = ADC(Pin(pino_adc))
        self.adc.atten(ADC.ATTN_11DB)      # 0V ~ 3.3V
        self.adc.width(ADC.WIDTH_12BIT)    # 0 ~ 4095

    def ler(self):
        return self.adc.read()

    def porcentagem_luz(self):
        leitura = self.ler()

        # Inverte porque a maioria dos módulos LDR
        # gera valores menores quando há mais luz
        return round((4095 - leitura) * 100 / 4095, 2)
