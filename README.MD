# Sistema de Monitoramento de Ambientes para Neurodivergentes (SMAN)

O **SMAN** é um projeto acadêmico de sistema embarcado focado no monitoramento de variáveis ambientais como ruído, iluminação e qualidade do ar. O objetivo é coletar esses dados em tempo real para ajudar na identificação de fatores que possam impactar o conforto e a concentração de indivíduos neurodivergentes.

---

## 🏗️ Arquitetura do Sistema

O ecossistema é dividido em três partes principais:

1. **Sistemas Embarcados (Firmware):** Código em **MicroPython** rodando em um **ESP32**. Ele faz a leitura periódica dos sensores e envia as informações (JSON) para um broker **MQTT**.
2. **Backend:** Servidor em **Node.js (Express)** que recebe os dados do broker MQTT. Ele gerencia as regras de negócio e salva as informações em um banco de dados híbrido: **PostgreSQL** para dados cadastrais/configurações e **MongoDB** para os logs de telemetria.
3. **Frontend:** Dashboard web em **React + Bootstrap** que exibe os gráficos de monitoramento em tempo real atualizados via **WebSockets**.

---

## 🛠️ Sensores e Variáveis Monitoradas

O hardware foi planejado para os seguintes componentes:

* **ENS160 + AHT21:** Coleta de qualidade do ar (gases e CO2), temperatura e umidade.
* **BH1750:** Medição de luminosidade em lux.
* **INMP441:** Microfone digital I2S para estimativa de nível de ruído.

*Nota: Para validação no simulador (Wokwi), foram utilizados sensores equivalentes/simulados para testar a lógica do firmware antes da montagem física.*

---

## 📂 Estrutura do Repositório

* `src/firmware/`: Código-fonte do ESP32, arquivos de inicialização e drivers de leitura.
* `src/backend/`: API em Node.js, listeners do MQTT e conexões com os bancos.
* `src/frontend/`: Interface em React com os componentes de gráficos do painel.
* `docs/`: Documentação de requisitos, diagramas e relatórios técnicos.