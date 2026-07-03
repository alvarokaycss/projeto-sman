# main.py - Código principal (Firmware Integrado) do SMAN
#
# PINOS DE HARDWARE CONECTADOS:
#   - LDR (Luminosidade): GPIO 34 (Entrada Analógica ADC)
#   - AHT21 (Temperatura e Umidade): SDA=GPIO 21, SCL=GPIO 22
#
# SENSORES NÃO CONECTADOS (ENVIANDO 0):
#   - INMP441 (Som): Manda 0.0
#   - ENS160 (Gases/CO2): Manda 0

import time
import json
import ntptime
import network
from machine import Pin, I2C
import wifi
from ldr import SensorLDR
from umqtt_simple import MQTTClient

# ==============================================================================
# CONFIGURAÇÕES DO SISTEMA
# ==============================================================================

# MAC padrão registrado na seed do banco de dados para a ESP de teste
MAC_ADDRESS = "b4:bf:e9:0e:0c:08"

# Endereço IP do computador rodando o Docker na rede local.
# IMPORTANTE: Atualize este IP com o IP da sua máquina na rede local.
MQTT_BROKER = "172.20.10.2"
MQTT_PORT = 1883
MQTT_CLIENT_ID = "sman_esp32_device"
TOPIC_TELEMETRIA = f"ambiente/{MAC_ADDRESS}/telemetria"

# Intervalo de leitura periódico configurável (em segundos)
INTERVALO_LEITURA = 5  

# Endereço I2C do AHT21
AHT21_ADDR = 0x38

# ==============================================================================
# ESTRUTURA PARA SUAVIZAÇÃO DE RUÍDO (Média Móvel)
# ==============================================================================
class MediaMovel:
    def __init__(self, tamanho=5):
        self.tamanho = tamanho
        self.valores = []
    
    def adicionar(self, valor):
        if valor is not None:
            self.valores.append(valor)
            if len(self.valores) > self.tamanho:
                self.valores.pop(0)
        return sum(self.valores) / len(self.valores) if self.valores else 0.0

# ==============================================================================
# FUNÇÕES DE LEITURA DIRETA DO AHT21 (SEM DRIVER IMPORTADO)
# ==============================================================================
def inicializar_aht21(i2c_bus):
    try:
        # Envia o comando de calibração/inicialização exigido pelo datasheet (0xBE)
        i2c_bus.writeto(AHT21_ADDR, b'\xbe\x08\x00')
        time.sleep_ms(50)
        print("✅ Sensor AHT21 (Clima) Inicializado com Sucesso!")
        return True
    except Exception as e:
        print("❌ Erro crítico ao se comunicar com o AHT21:", e)
        return False

def ler_aht21(i2c_bus):
    try:
        # 1. Envia o comando de gatilho para iniciar a medição (0xAC)
        i2c_bus.writeto(AHT21_ADDR, b'\xac\x33\x00')
        time.sleep_ms(80) # Aguarda o tempo de conversão física do sensor
        
        # 2. Lê os 6 bytes de resposta retornados pelo sensor
        dados = i2c_bus.readfrom(AHT21_ADDR, 6)
        
        # 3. Reconstrói os dados brutos de 20 bits
        u_bruta = ((dados[1] << 12) | (dados[2] << 4) | (dados[3] >> 4))
        t_bruta = (((dados[3] & 0x0f) << 16) | (dados[4] << 8) | dados[5])
        
        # 4. Aplica as fórmulas matemáticas oficiais do fabricante
        temp = (t_bruta / 1048576.0) * 200.0 - 50.0
        umid = (u_bruta / 1048576.0) * 100.0
        
        return temp, umid
    except Exception as e:
        print("Erro durante a leitura dos dados AHT21:", e)
        return None, None

# ==============================================================================
# INICIALIZAÇÃO DE PERIFÉRICOS
# ==============================================================================
print("\n--- INICIALIZANDO PERIFÉRICOS E SENSORES ---")

# 1. Sensor LDR
sensor_ldr = SensorLDR(pino_adc=34)
print("[SENSOR] LDR configurado no pino GPIO 34.")

# 2. Barramento I2C para Clima (AHT21)
try:
    i2c = I2C(0, scl=Pin(22), sda=Pin(21), freq=100000)
    dispositivos_i2c = i2c.scan()
    print("[I2C] Dispositivos encontrados no barramento:", dispositivos_i2c)
except Exception as e:
    print("[I2C ERROR] Falha ao inicializar barramento I2C:", e)
    i2c = None
    dispositivos_i2c = []

# Inicializa AHT21 diretamente
aht_disponivel = False
if i2c and AHT21_ADDR in dispositivos_i2c:
    aht_disponivel = inicializar_aht21(i2c)
else:
    print("[SENSOR WARNING] AHT21 não encontrado no barramento I2C.")

# Criando as médias móveis para os sensores reais
filtro_temp = MediaMovel(5)
filtro_umid = MediaMovel(5)
filtro_luz = MediaMovel(5)

# ==============================================================================
# CONECTIVIDADE (WIFI E MQTT)
# ==============================================================================
client = None
mqtt_conectado = False

def sincronizar_horario_ntp():
    """Sincroniza o relógio interno do ESP32 com servidores NTP"""
    try:
        ntptime.settime()
        print("[NTP] Sincronização de horário realizada com sucesso.")
    except Exception as e:
        print("[NTP ERROR] Falha ao sincronizar horário:", e)

def conectar_mqtt():
    """Tenta conectar ao broker MQTT"""
    global client, mqtt_conectado
    try:
        client = MQTTClient(MQTT_CLIENT_ID, MQTT_BROKER, port=MQTT_PORT)
        client.connect()
        mqtt_conectado = True
        print("[MQTT] Conectado ao broker Mosquitto.")
    except Exception as e:
        print(f"[MQTT ERROR] Falha de conexão com o broker {MQTT_BROKER}: {e}")
        mqtt_conectado = False

def obter_timestamp_iso():
    """Retorna o timestamp atual no formato ISO 8601 UTC"""
    t = time.gmtime()
    return "{:04d}-{:02d}-{:02d}T{:02d}:{:02d}:{:02d}Z".format(
        t[0], t[1], t[2], t[3], t[4], t[5]
    )

# Executa conexões iniciais
wifi.conectar_wifi()
if network.WLAN(network.STA_IF).isconnected():
    sincronizar_horario_ntp()
conectar_mqtt()

# ==============================================================================
# LOOP PRINCIPAL DE EXECUÇÃO
# ==============================================================================
print("\n--- INICIANDO TRANSMISSÃO DE TELEMETRIA REAL/MOCK ---")
ultimo_envio = time.time()
uptime = 0

try:
    while True:
        # Tratamento de reconexão de Wi-Fi e MQTT (tenta de 5 em 5 segundos após falha)
        sta_if = network.WLAN(network.STA_IF)
        if not sta_if.isconnected():
            print("[CONECTIVIDADE] Wi-Fi desconectado! Tentando reconectar...")
            wifi.conectar_wifi()
            if sta_if.isconnected():
                sincronizar_horario_ntp()

        if not mqtt_conectado:
            print("[CONECTIVIDADE] MQTT offline. Tentando reconectar ao broker...")
            conectar_mqtt()
            if not mqtt_conectado:
                time.sleep(5)  
                continue

        # Executa leitura apenas no intervalo configurado
        tempo_atual = time.time()
        if tempo_atual - ultimo_envio >= INTERVALO_LEITURA:
            uptime += INTERVALO_LEITURA
            ultimo_envio = tempo_atual
            
            # --- LEITURA FÍSICA E TRATAMENTO DOS SENSORES ---
            
            # 1. Luz (LDR) - REAL
            try:
                luz_bruta = sensor_ldr.porcentagem_luz()
                luz_filtrada = filtro_luz.adicionar(luz_bruta)
                status_ldr = "OK"
            except Exception as e:
                print(f"[LOG ERRO] Falha no LDR: {e}")
                luz_filtrada = filtro_luz.adicionar(0.0)
                status_ldr = "ERRO"

            # 2. Som (INMP441) - DESATIVADO (Manda 0.0)
            som_filtrado = 0.0
            status_som = "NAO_CONECTADO"

            # 3. Clima (AHT21) - REAL
            temp_lida = None
            umid_lida = None
            status_clima = "OK"
            if i2c and aht_disponivel:
                try:
                    temp_lida, umid_lida = ler_aht21(i2c)
                except Exception as e:
                    print(f"[LOG ERRO] Falha de leitura AHT21: {e}")
                    status_clima = "ERRO"
            else:
                status_clima = "DESCONECTADO"

            # Fallbacks se o sensor falhar (banco de dados exige número)
            if temp_lida is None:
                temp_lida = 0.0
            if umid_lida is None:
                umid_lida = 0.0

            temp_filtrada = filtro_temp.adicionar(temp_lida)
            umid_filtrada = filtro_umid.adicionar(umid_lida)

            # 4. Qualidade do Ar (ENS160) - DESATIVADO (Manda 0)
            eco2_filtrado = 0
            tvoc_filtrado = 0
            aqi_filtrado = 0
            status_qualidade = "NAO_CONECTADO"

            # --- CONTRUÇÃO DO PAYLOAD JSON ---
            payload = {
                "mac_address": MAC_ADDRESS,
                "timestamp": obter_timestamp_iso(),
                "metricas": {
                    "clima": {
                        "temperatura": round(temp_filtrada, 2),
                        "umidade": round(umid_filtrada, 2)
                    },
                    "qualidade_ar": {
                        "eco2": eco2_filtrado,
                        "tvoc": tvoc_filtrado,
                        "aqi": aqi_filtrado
                    },
                    "luminosidade": {
                        "porcentagem": round(luz_filtrada, 2)
                    },
                    "som": {
                        "decibeis": round(som_filtrado, 2)
                    }
                },
                "status_sensores": {
                    "ldr": status_ldr,
                    "som": status_som,
                    "clima": status_clima,
                    "qualidade_ar": status_qualidade
                }
            }

            # --- TRANSMISSÃO MQTT ---
            try:
                mensagem_json = json.dumps(payload)
                client.publish(TOPIC_TELEMETRIA, mensagem_json)
                
                print(f"[{obter_timestamp_iso()}] [MQTT ENVIO OK] Uptime: {uptime}s | "
                      f"Temp: {payload['metricas']['clima']['temperatura']}°C | "
                      f"Umid: {payload['metricas']['clima']['umidade']}% | "
                      f"Luz: {payload['metricas']['luminosidade']['porcentagem']}% | "
                      f"Som: {payload['metricas']['som']['decibeis']}dB (Status: {status_som}) | "
                      f"eCO2: {payload['metricas']['qualidade_ar']['eco2']}ppm (Status: {status_qualidade})")
            except Exception as e:
                print(f"[MQTT SEND ERROR] Falha ao publicar mensagem: {e}")
                mqtt_conectado = False 

        time.sleep(0.5)

except KeyboardInterrupt:
    print("\n[SYSTEM] Transmissão interrompida pelo usuário.")
finally:
    if client and mqtt_conectado:
        try:
            client.disconnect()
        except Exception:
            pass
    print("[SYSTEM] Transmissão encerrada.")
