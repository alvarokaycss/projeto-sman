# test_ens160_aht2x.py - Teste individual dos Sensores I2C (ENS160 e AHT2x)
#
# PINOS UTILIZADOS:
#   - SDA: GPIO 21 (dados I2C)
#   - SCL: GPIO 22 (clock I2C)
#
# ENDEREÇOS I2C PADRÃO:
#   - AHT2x: 0x38 (Decimal: 56)
#   - ENS160: 0x53 (Decimal: 83)

import time
from machine import Pin, I2C
from aht2x import AHT2x
from ens160 import ENS160

print("=========================================")
print("Iniciando Teste Individual dos Sensores I2C")
print("Pinos Conectados: SDA = GPIO 21, SCL = GPIO 22")
print("=========================================")

# 1. Inicializa o barramento I2C
try:
    i2c = I2C(0, scl=Pin(22), sda=Pin(21))
    print("[I2C] Barramento inicializado.")
except Exception as e:
    print("[ERROR I2C] Falha ao inicializar o barramento I2C:", e)
    i2c = None

# 2. Escaneia o barramento para ver se os chips respondem fisicamente
if i2c:
    print("[I2C] Escaneando barramento...")
    dispositivos = i2c.scan()
    print("[I2C] Dispositivos encontrados (endereço decimal):", dispositivos)

    # 0x38 (56) = AHT2x, 0x53 (83) = ENS160
    if 56 in dispositivos:
        print("  -> AHT2x detectado fisicamente no endereço 0x38.")
    else:
        print("  -> [AVISO] AHT2x NÃO detectado no endereço 0x38.")

    if 83 in dispositivos:
        print("  -> ENS160 detectado fisicamente no endereço 0x53.")
    else:
        print("  -> [AVISO] ENS160 NÃO detectado no endereço 0x53 (sensor com problemas/desconectado).")

# 3. Inicializa os objetos dos drivers tratando erros individualmente
aht = None
ens = None

if i2c:
    # Inicializando AHT2x
    try:
        aht = AHT2x(i2c, address=0x38)
        print("[AHT2x] Driver inicializado com sucesso.")
    except Exception as e:
        print("[ERROR AHT2x] Falha ao inicializar driver do AHT2x:", e)

    # Inicializando ENS160
    try:
        ens = ENS160(i2c, address=0x53)
        print("[ENS160] Driver inicializado com sucesso.")
    except Exception as e:
        print("[ERROR ENS160] Falha ao inicializar driver do ENS160 (comum se o chip estiver com falha):", e)

# 4. Loop de leitura periódico resiliente
print("\nIniciando leituras (pressione Ctrl+C para parar)...")
try:
    while True:
        print("-----------------------------------------")

        # Leitura do AHT2x (Temperatura e Umidade)
        if aht:
            try:
                temp = aht.temperature
                umid = aht.relative_humidity
                print("Leitura Clima (AHT2x):")
                print("  - Temperatura:", round(temp, 2), "°C")
                print("  - Umidade    :", round(umid, 2), "%")
            except Exception as e:
                print("[ERROR AHT2x] Erro durante a leitura do clima:", e)
        else:
            print("Leitura Clima (AHT2x): Não disponível (Driver não inicializado)")

        # Leitura do ENS160 (Qualidade do Ar)
        if ens:
            try:
                # O ENS160 permite compensação enviando temperatura e umidade lidas pelo AHT
                if aht:
                    try:
                        ens.temperature = temp
                        ens.humidity = umid
                    except Exception:
                        pass # ignora falha na compensação se der erro

                eco2 = ens.eco2
                tvoc = ens.tvoc
                aqi = ens.aqi

                print("Leitura Qualidade do Ar (ENS160):")
                print("  - eCO2 (Dióxido de Carbono Equiv.):", eco2, "ppm")
                print("  - TVOC (Compostos Orgânicos Vol.)  :", tvoc, "ppb")
                print("  - AQI (Índice de Qualidade do Ar)  :", aqi, "(1 a 5)")
            except Exception as e:
                print("[ERROR ENS160] Erro durante a leitura de qualidade do ar:", e)
        else:
            print("Leitura Qualidade do Ar (ENS160): Não disponível (Driver não inicializado ou sensor com falha)")

        time.sleep(2.0)

except KeyboardInterrupt:
    print("\nTeste de sensores I2C interrompido pelo usuário.")
