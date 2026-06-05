import time


class AHT2x:
    def __init__(self, i2c, address=0x38):
        self.i2c = i2c
        self.address = address
        time.sleep_ms(20)
        self.reset()

    def reset(self):
        self.i2c.writeto(self.address, b'\xba')
        time.sleep_ms(20)

    @property
    def status(self):
        return self.i2c.readfrom(self.address, 1)[0]

    @property
    def is_ready(self):
        return not (self.status & 0x80)

    def trigger_measurement(self):
        self.i2c.writeto(self.address, b'\xac\x33\x00')

    def read_data(self):
        self.trigger_measurement()
        while not self.is_ready:
            time.sleep_ms(10)
        data = self.i2c.readfrom(self.address, 6)
        return data

    @property
    def relative_humidity(self):
        data = self.read_data()
        raw_humidity = ((data[1] << 12) | (data[2] << 4) | (data[3] >> 4))
        return (raw_humidity / 1048576.0) * 100.0

    @property
    def temperature(self):
        data = self.read_data()
        raw_temperature = (((data[3] & 0x0F) << 16) | (data[4] << 8) | data[5])
        return ((raw_temperature / 1048576.0) * 200.0) - 50.0
