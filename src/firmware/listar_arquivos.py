# listar_arquivos.py - Lista todos os arquivos salvos no ESP32
#
# Execute este script no ESP32 para verificar quais arquivos foram de fato
# transferidos para a memória interna da placa e os seus tamanhos correspondentes.

import os

print("==================================================")
print("  ARQUIVOS PRESENTES NA MEMÓRIA INTERNA DO ESP32")
print("==================================================")


def listar_diretorio(diretorio=""):
    try:
        itens = os.listdir(diretorio)
        if not itens:
            print(f"Diretório '{diretorio or '/'}' está vazio.")
            return

        for item in itens:
            caminho_completo = diretorio + "/" + item if diretorio else item
            try:
                info = os.stat(caminho_completo)
                tamanho = info[6] # Indice 6 do stat contem o tamanho em bytes
                tipo = info[0]

                # Checa se é diretório (bits de S_IFDIR)
                eh_diretorio = (tipo & 0x4000) != 0

                if eh_diretorio:
                    print(f"[DIR]  {caminho_completo}/")
                    listar_diretorio(caminho_completo) # Lista recursivamente
                else:
                    print(f"arq:   {caminho_completo:<30} | {tamanho:>6} bytes")
            except Exception:
                print(f"arq:   {caminho_completo:<30} | (tamanho indisponível)")
    except Exception as e:
        print(f"Erro ao listar '{diretorio or '/'}': {e}")


# Executa a listagem a partir da raiz
listar_diretorio()
print("==================================================")
