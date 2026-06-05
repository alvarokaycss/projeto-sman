import time


class ENS160:
    def __init__(self, i2c, address=0x53):
        self.i2c = i2c
        self.address = address
        self.reset()
        time.sleep_ms(10)
        # Coloca o sensor em modo de operação padrão (Standard Operating Mode)
        self.i2c.writeto_mem(self.address, 0x10, b'\x02')
        time.sleep_ms(10)

    def reset(self):
        self.i2c.writeto_mem(self.address, 0x10, b'\x06')

    @property
    def tvoc(self):
        # Lê os registros de dados de compostos orgânicos voláteis
        data = self.i2c.readfrom_mem(self.address, 0x22, 2)
        return data[0] | (data[1] << 8)

    @property
    def eco2(self):
        # Lê os registros de dados de CO2 equivalente
        data = self.i2c.readfrom_mem(self.address, 0x24, 2)
        return data[0] | (data[1] << 8)

    @property
    def aqi(self):
        # Lê o índice de qualidade do ar (1 a 5)
        status = self.i2c.readfrom_mem(self.address, 0x21, 1)[0]
        return status & 0x07

    @property
    def temperature(self):
        return 0.0

    @temperature.setter
    def temperature(self, val):
        # Envia compensação de temperatura ambiente para o cálculo interno do ENS160
        raw = int((val + 273.15) * 64)
        self.i2c.writeto_mem(self.address, 0x13, bytes([raw & 0xFF, (raw >> 8) & 0xFF]))

    @property
    def humidity(self):
        return 0.0

    @humidity.setter
    def humidity(self, val):
        # Envia compensação de umidade ambiente
        raw = int(val * 512)
        self.i2c.writeto_mem(self.address, 0x15, bytes([raw & 0xFF, (raw >> 8) & 0xFF]))
