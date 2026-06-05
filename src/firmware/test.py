import machine
print(machine.I2C(0, scl=machine.Pin(22), sda=machine.Pin(21)).scan())
