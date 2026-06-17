from machine import Pin, I2C

print("SDA =", Pin(21, Pin.IN, Pin.PULL_UP).value())
print("SCL =", Pin(22, Pin.IN, Pin.PULL_UP).value())

i2c = I2C(0, scl=Pin(22), sda=Pin(21))
print(i2c.scan())
