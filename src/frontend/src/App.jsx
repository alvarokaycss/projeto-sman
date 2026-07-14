import "./App.css";
import { History } from "./components/History";
import { GaugeChart } from "./components/Gauge";
import DynamicLineChart from "./components/DynamicLineChart";
import { useState, useEffect } from "react";
import { io } from "socket.io-client";
import { ConfigForm } from "./components/MetricForm";

// Importações dos metadados e do score inicial
import { linesConfig, generalMediaConfig } from "./sensorSchema";

const mockConfig = {
  temp_min: 18,
  temp_max: 26,
  umid_min: 40,
  umid_max: 60,
  luminosidade_min: 300,
  luminosidade_max: 800,
  eco2_max: 1000,
  som_max: 65,
};

export function App() {
  const [chartData, setChartData] = useState([]);
  const [lines, setLines] = useState(linesConfig);
  const [generalMedia, setGeneralMedia] = useState(generalMediaConfig);
  const [alertLogs, setAlertLogs] = useState([]);
  const [selectedProfile, setSelectedProfile] = useState("padrao");
  const [latestGatilhos, setLatestGatilhos] = useState([]);
  const [currentConfig, setCurrentConfig] = useState(mockConfig);

  // useEffect para carregar as configurações de limite do banco de dados (PostgreSQL)
  useEffect(() => {
    const macDispositivo = "b4:bf:e9:0e:0c:08";
    fetch(
      `http://${window.location.hostname}:3000/api/config/${macDispositivo}`,
    )
      .then((res) => {
        if (!res.ok) {
          throw new Error("Erro ao buscar configurações");
        }
        return res.json();
      })
      .then((config) => {
        console.log("Configurações de limites carregadas do Postgres:", config);

        setLines((prevLines) =>
          prevLines.map((sensor) => {
            let limiteMin = sensor.min;
            let limiteMax = sensor.max;

            // Mapeia as chaves correspondentes do banco PostgreSQL
            if (sensor.dataKey === "temperatura") {
              limiteMin = config.temp_min ?? sensor.min;
              limiteMax = config.temp_max ?? sensor.max;
            } else if (sensor.dataKey === "umidade") {
              limiteMin = config.umid_min ?? sensor.min;
              limiteMax = config.umid_max ?? sensor.max;
            } else if (sensor.dataKey === "co2") {
              limiteMax = config.eco2_max ?? sensor.max;
            } else if (sensor.dataKey === "ruido") {
              limiteMax = config.som_max ?? sensor.max;
            } else if (sensor.dataKey === "luminosidade") {
              limiteMin = config.luminosidade_min ?? sensor.min;
              limiteMax = config.luminosidade_max ?? sensor.max;
            }

            return { ...sensor, min: limiteMin, max: limiteMax };
          }),
        );
      })
      .catch((err) => {
        console.error("Erro ao buscar configurações de limite:", err);
      });
  }, []);

  // useEffect para recalcular o Score Geral toda vez que o perfil ou os gatilhos mudarem
  useEffect(() => {
    const pesosMap = {
      padrao: {
        Temperatura: 1.0,
        Som: 1.0,
        Eco2: 1.0,
        Umidade: 1.0,
        Luminosidade: 1.0,
      },
      tea: {
        Temperatura: 1.0,
        Som: 2.5,
        Eco2: 1.0,
        Umidade: 1.0,
        Luminosidade: 2.0,
      },
      tdah: {
        Temperatura: 1.0,
        Som: 2.0,
        Eco2: 2.5,
        Umidade: 1.0,
        Luminosidade: 1.0,
      },
    };

    const pesos = pesosMap[selectedProfile] || pesosMap.padrao;
    let penalidadeTotal = 0;

    latestGatilhos.forEach((gatilho) => {
      const parametro = gatilho.parametro || "";
      const peso = pesos[parametro] ?? 1.0;
      // Penalização de 15 pontos base por sensor com inconformidade multiplicada pelo peso
      penalidadeTotal += 15 * peso;
    });

    const scoreCalculado = Math.max(10, Math.round(100 - penalidadeTotal));
    setGeneralMedia((prev) => ({ ...prev, currentValue: scoreCalculado }));
  }, [selectedProfile, latestGatilhos]);

  // useEffect para conectar e escutar a telemetria em tempo real
  useEffect(() => {
    const socket = io(`http://${window.location.hostname}:3000`);

    socket.on("connect", () => {
      console.log("Conectado ao servidor de WebSockets!");
    });

    socket.on("dashboard:geral", (data) => {
      console.log("Dados recebidos via WS:", data);

      // Extrai métricas reais/simuladas do payload do ESP32
      const temp = data.metricas?.clima?.temperatura ?? 0;
      const umid = data.metricas?.clima?.umidade ?? 0;
      const co2 = data.metricas?.qualidade_ar?.eco2 ?? 0;
      const ruido = data.metricas?.som?.decibeis ?? 0;
      const luz = data.metricas?.luminosidade?.porcentagem ?? 0;
      const aqi = data.metricas?.qualidade_ar?.aqi ?? 1;

      // Atualiza valores atuais nos Gauges
      setLines((prevLines) =>
        prevLines.map((sensor) => {
          let valorAtualizado = sensor.currentValue;
          if (sensor.dataKey === "temperatura") valorAtualizado = temp;
          else if (sensor.dataKey === "umidade") valorAtualizado = umid;
          else if (sensor.dataKey === "co2") valorAtualizado = co2;
          else if (sensor.dataKey === "ruido") valorAtualizado = ruido;
          else if (sensor.dataKey === "luminosidade") valorAtualizado = luz;
          else if (sensor.dataKey === "aqi") valorAtualizado = aqi;

          return { ...sensor, currentValue: valorAtualizado };
        }),
      );

      // Atualiza o gráfico de linha histórico em tempo real
      setChartData((prevChartData) => {
        const horaLeitura = new Date(data.timestamp).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        });

        const novoPonto = {
          name: horaLeitura,
          temperatura: temp,
          umidade: umid,
          co2: co2,
          ruido: ruido,
          aqi: aqi,
          luminosidade: luz,
        };

        const novosDados = [...prevChartData, novoPonto];
        if (novosDados.length > 10) {
          novosDados.shift();
        }
        return novosDados;
      });

      // Atualiza a lista de gatilhos ativos para acionar o cálculo do Score Ponderado
      const gatilhos = data.alerta?.gatilhos ?? [];
      const alertaAtivo = data.alerta?.ativo ?? false;
      setLatestGatilhos(gatilhos);

      // Adiciona os alertas no painel History
      if (alertaAtivo && gatilhos.length > 0) {
        setAlertLogs((prevLogs) => {
          const timestamp = data.timestamp
            ? new Date(data.timestamp)
            : new Date();
          const timeLabel = timestamp.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          });

          const newLogs = gatilhos.map((gatilho, index) => {
            // Mapeamento direto pelo campo 'parametro' gerado pelo backend (LeituraProcessada.js)
            const parametro = gatilho.parametro || "";

            const iconMap = {
              Temperatura: {
                icon: "fa-solid fa-temperature-high",
                title: "ALERTA DE CALOR",
              },
              Som: {
                icon: "fa-solid fa-volume-high",
                title: "ALERTA DE RUÍDO",
              },
              Eco2: { icon: "fa-solid fa-wind", title: "ALERTA DE CO₂" },
              Umidade: {
                icon: "fa-solid fa-droplet",
                title: "ALERTA DE UMIDADE",
              },
              Luminosidade: {
                icon: "fa-solid fa-lightbulb",
                title: "ALERTA DE LUMINOSIDADE",
              },
            };

            const { icon, title } = iconMap[parametro] ?? {
              icon: "fa-solid fa-triangle-exclamation",
              title: "Alerta de Monitoramento",
            };

            return {
              id: `${timestamp.getTime()}-${index}`,
              icon,
              title,
              message: gatilho.mensagem || "Alerta de limite excedido",
              time: timeLabel,
            };
          });

          return [...newLogs, ...prevLogs].slice(0, 5); // Mantém apenas os últimos 5 alertas
        });
      }
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <>
      <ConfigForm currentConfig={currentConfig} />
      <main className="dashboard">
        <section className="generalSection">
          <div className="profileSelector">
            <label htmlFor="profile-select">PERFIL SENSORIAL:</label>
            <select
              id="profile-select"
              value={selectedProfile}
              onChange={(e) => setSelectedProfile(e.target.value)}
            >
              <option value="padrao">PADRÃO</option>
              <option value="tea">TEA - HIPERSENSIBILIDADE</option>
              <option value="tdah">TDAH - FOCO</option>
            </select>
            <p className="profileMessage">
              Ajusta o nível de conforto de acordo com o perfil sensorial
              selecionado.
            </p>
          </div>
          <div className="generalGauge">
            <GaugeChart
              value={generalMedia.currentValue}
              max={generalMedia.max}
              min={generalMedia.min}
              metric={generalMedia.label}
              symbol={generalMedia.symbol}
            />
          </div>
          <div className="historyContainer">
            <History logs={alertLogs} />
          </div>
        </section>

        <section className="specificSection">
          <div className="timelineChart">
            <DynamicLineChart data={chartData} linesConfig={lines} />
          </div>

          <div className="gaugesGrid">
            {lines.map((sensor, index) => (
              <div className="gaugeContainer" key={index}>
                <GaugeChart
                  value={sensor.currentValue}
                  max={sensor.max}
                  min={sensor.min}
                  symbol={sensor.symbol}
                  metric={sensor.label}
                />
              </div>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
