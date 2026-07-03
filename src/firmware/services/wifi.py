import network
import time


def conectar_wifi():
    print("Iniciando SMAN Firmware - Conectando ao WiFi", end="")
    sta_if = network.WLAN(network.STA_IF)
    sta_if.active(True)

    # Conecta à rede portátil configurada
    sta_if.connect('Alvaro', 'santos37611895')

    timeout = 0
    while not sta_if.isconnected() and timeout < 100:
        print(".", end="")
        time.sleep(0.1)
        timeout += 1

    if sta_if.isconnected():
        print("\n[WIFI] Conectado com sucesso!")
        print("[WIFI] Configurações de rede:", sta_if.ifconfig())
    else:
        print("\n[WIFI] Falha ao conectar. Operando em modo offline.")
