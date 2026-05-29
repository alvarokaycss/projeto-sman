# Sistema de Monitoramento de Ambientes para Neurodivergentes (SMAN)

O **SMAN** é um ecossistema inteligente baseado em Sistemas Embarcados e Internet das Coisas (IoT), projetado para coletar, analisar e gerenciar variáveis ambientais cruciais para a autorregulação e bem-estar de indivíduos neurodivergentes.

O projeto atua como um hub integrador focado no monitoramento contínuo de estressores cognitivos e sensoriais (como excesso de ruído, iluminação inadequada e má qualidade do ar), servindo de suporte em contextos clínicos e acadêmicos.

---

## 🏗️ Arquitetura do Sistema

O projeto é estruturado em três camadas fundamentais:

1. **Hardware / IoT (Sistemas Embarcados):** Firmware baseado em microcontrolador **ESP32** desenvolvido em **MicroPython**. Realiza a leitura periódica dos sensores e publica os dados em formato JSON em um broker através do protocolo **MQTT**.
2. **Backend (Camada de Serviços):** barramento de serviços responsável por processar e validar as métricas frente a parâmetros normativos e clínicos. Utiliza um banco híbrido composto por **PostgreSQL** (configurações, perfis e regras de negócio) e **MongoDB** (telemetria contínua e série temporal de dados).
3. **Frontend (Interface do Usuário):** Dashboard clínico em **React** que disponibiliza a visualização gráfica das métricas em tempo real utilizando comunicação via **WebSockets**.

---

## 🛠️ Especificação de Sensores e Variáveis

O ecossistema foi projetado para operar com sensores digitais especializados, embora validações preliminares tenham sido feitas com componentes simulados equivalentes:

* **ENS160 + AHT21:** Monitoramento multidimensional de gases (compostos orgânicos voláteis - TVOC, eCO2), além de temperatura e umidade relativa do ar.
* **BH1750:** Medição precisa de luminosidade ambiental expressa em Lux.
* **INMP441:** Microfone digital I2S utilizado para a captura de intensidade sonora e cálculo relativo de ruído.

---

## 📂 Organização do Repositório

* `src/firmware/`: Scripts de inicialização, drivers de hardware e o loop principal executado pelo ESP32.
* `src/backend/`: Lógica de processamento de regras, monitoramento de anomalias e APIs de serviços.
* `src/frontend/`: Interface de usuário baseada em dashboards dinâmicos para acompanhamento clínico.
* `docs/`: Arquivos complementares de documentação, requisitos e diagramas de arquitetura do projeto.

---

## 🎯 Requisitos de Conformidade Técnica

Em construção.