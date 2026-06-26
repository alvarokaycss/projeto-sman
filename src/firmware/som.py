# som.py - Driver/Classe de controle para o Microfone Digital INMP441 (I2S)
#
# PINOS PADRÃO UTILIZADOS:
#   - SCK -> GPIO 14
#   - WS  -> GPIO 15
#   - SD  -> GPIO 32

import math
import struct
from machine import Pin, I2S


class SensorSom:
    def __init__(self, sck_pin=14, ws_pin=15, sd_pin=32):
        self.sck_pin_num = sck_pin
        self.ws_pin_num = ws_pin
        self.sd_pin_num = sd_pin
        self.i2s = None
        self.buffer = bytearray(1024)
        self.inicializar()

    def inicializar(self):
        """Inicializa a interface I2S para captura do áudio."""
        try:
            self.i2s = I2S(
                0,
                sck=Pin(self.sck_pin_num),
                ws=Pin(self.ws_pin_num),
                sd=Pin(self.sd_pin_num),
                mode=I2S.RECEIVER,
                bits=32,
                format=I2S.MONO,
                rate=16000,
                ibuf=2048
            )
            print("[SensorSom] Interface I2S inicializada com sucesso.")
            return True
        except Exception as e:
            print(f"[SensorSom] Erro ao inicializar I2S (SCK={self.sck_pin_num}, WS={self.ws_pin_num}, SD={self.sd_pin_num}): {e}")
            self.i2s = None
            return False

    def ler_decibeis(self):
        """Lê do microfone, processa os dados digitais (RMS) e retorna decibéis relativos."""
        if not self.i2s:
            # Tenta inicializar caso tenha falhado anteriormente (auto-recuperação)
            if not self.inicializar():
                return 40.0  # Retorna um valor padrão seguro de ruído de fundo
            
        try:
            # Lê dados do DMA para o buffer de forma não-bloqueante
            n_bytes = self.i2s.readinto(self.buffer)
            
            if n_bytes > 0:
                quantidade_amostras = n_bytes // 4
                # Desempacota os dados de 32-bit assinados
                amostras = struct.unpack('<%di' % quantidade_amostras, self.buffer[:n_bytes])
                
                soma_quadrados = 0.0
                for amostra in amostras:
                    # Normaliza para a faixa flutuante [-1.0, 1.0]
                    valor_normalizado = amostra / 2147483648.0
                    soma_quadrados += valor_normalizado * valor_normalizado
                
                # RMS
                media_quadrados = soma_quadrados / quantidade_amostras
                rms = math.sqrt(media_quadrados)
                
                # Conversão para decibéis relativos
                if rms > 0.0:
                    decibeis = 20.0 * math.log10(rms / 0.00002)
                else:
                    decibeis = 30.0
                
                # Limita dentro de uma faixa operacional útil e realista
                return round(max(30.0, min(110.0, decibeis)), 2)
                
        except Exception as e:
            print(f"[SensorSom] Falha de leitura I2S: {e}. Tentando reinicializar...")
            # Auto-recuperação de barramento instável
            self.desativar()
            self.inicializar()
            
        return 40.0  # Retorna valor seguro se houver falhas

    def desativar(self):
        """Desativa a interface I2S para liberar recursos de hardware."""
        if self.i2s:
            try:
                self.i2s.deinit()
                print("[SensorSom] Interface I2S desativada.")
            except Exception:
                pass
            self.i2s = None
