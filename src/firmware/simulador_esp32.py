# flake8: noqa

import time
import json
import random
from datetime import datetime, timezone
from paho.mqtt import client as mqtt_client
from paho.mqtt.enums import CallbackAPIVersion


# Configurações de Rede
BROKER = 'localhost'
PORT = 1883
MAC_ADDRESS = 'b4:bf:e9:0e:0c:08' 
TOPIC = f"ambiente/{MAC_ADDRESS}/telemetria"


def connect_mqtt():
    def on_connect(client, userdata, flags, rc, properties=None):
        if rc == 0:
            print("🟢 Simulador conectado com sucesso ao Broker Mosquitto!")
        else:
            print(f"🔴 Falha na conexão. Código de retorno (rc): {rc}")

    # Força o uso do protocolo estável clássico compatible com Mosquitto 2.x
    client = mqtt_client.Client(
        client_id="simulador_esp32_client", 
        callback_api_version=CallbackAPIVersion.VERSION2, # Se usar paho-mqtt atualizado
        protocol=mqtt_client.MQTTv311
    )
    
    client.on_connect = on_connect
    
    try:
        client.connect(BROKER, PORT, keepalive=60)
    except Exception as e:
        print(f"🔴 Não foi possível conectar ao broker em {BROKER}:{PORT}. Erro: {e}")
        
    return client


def gerar_dados_sensores():
    # Simula flutuações realistas nos sensores ambientais do SMAN
    # Variando em torno de médias comuns de laboratório
    return {
        "mac_address": MAC_ADDRESS,
        "timestamp": datetime.now(timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ'),
        "metricas": {
            "clima": {
                # Eventualmente gera picos acima do limite padrão de 26.0°C para testar o alerta
                "temperatura": round(random.uniform(22.0, 28.5), 2),
                "umidade": round(random.uniform(50.0, 68.0), 2)
            },
            "qualidade_ar": {
                "eco2": random.randint(400, 1350),  # Limite padrão é 1200
                "tvoc": random.randint(10, 260),    # Limite padrão é 250
                "aqi": random.randint(1, 3)
            },
            "luminosidade": {
                "porcentagem": round(random.uniform(40.0, 80.0), 2)
            },
            "som": {
                # Simula ruídos de passos, conversas ou silêncio (Limite padrão é 65.0 dB)
                "decibeis": round(random.uniform(40.0, 72.0), 2)
            }
        }
    }


def run():
    client = connect_mqtt()
    client.loop_start()

    print(f"Iniciando transmissão de telemetria simulada no tópico: {TOPIC}")
    print("Pressione Ctrl+C para encerrar.")

    try:
        while True:
            payload = gerar_dados_sensores()
            mensagem = json.dumps(payload)

            # Publica a string JSON no broker
            result = client.publish(TOPIC, mensagem)
            status = result[0]

            if status == 0:
                print(f"✅ Enviado: Temp={payload['metricas']['clima']['temperatura']}°C, "
                      f"Som={payload['metricas']['som']['decibeis']}dB, "
                      f"eCO2={payload['metricas']['qualidade_ar']['eco2']}ppm")
            else:
                print(f"❌ Falha ao enviar mensagem para o tópico {TOPIC}")

            time.sleep(5)  # Envia a cada 5 segundos respeitando os critérios de tempo real

    except KeyboardInterrupt:
        print("\n🛑 Simulador encerrado pelo usuário.")
        client.loop_stop()


if __name__ == '__main__':
    run()
