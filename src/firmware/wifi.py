import network
import time


def conectar_wifi():
    print("Iniciando SMAN Firmware - Conectando ao WiFi", end="")
    sta_if = network.WLAN(network.STA_IF)
    sta_if.active(True)

    # Conecta à rede simulada do Wokwi (ou credenciais locais futuras)
    sta_if.connect('DTEL_ADAILTON', 'santos37611895')

    timeout = 0
    while not sta_if.isconnected() and timeout < 100:
        print(".", end="")
        time.sleep(0.1)
        timeout += 1

    if sta_if.isconnected():
        # Força o uso do DNS do Google (8.8.8.8) para evitar falhas do provedor local (erro -202)
        try:
            config = sta_if.ifconfig()
            sta_if.ifconfig((config[0], config[1], config[2], '8.8.8.8'))
        except Exception:
            pass
        print("\n[WIFI] Conectado com sucesso!")
        print("[WIFI] Configurações de rede:", sta_if.ifconfig())
    else:
        print("\n[WIFI] Falha ao conectar. Operando em modo offline.")
