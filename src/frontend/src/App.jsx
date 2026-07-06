import "./App.css";
import { History } from "./components/History";
import { GaugeChart } from "./components/Gauge";
import DynamicLineChart from "./components/DynamicLineChart";
import { useState, useEffect } from "react";
import { io } from "socket.io-client";

// Importações dos metadados e do score inicial
import {
  linesConfig,
  generalMediaConfig,
} from "./sensorSchema";

export function App() {
  const [chartData, setChartData] = useState([]);
  const [lines, setLines] = useState(linesConfig);
  const [generalMedia, setGeneralMedia] = useState(generalMediaConfig);

  // useEffect para carregar as configurações de limite do banco de dados (PostgreSQL)
  useEffect(() => {
    const macDispositivo = "b4:bf:e9:0e:0c:08";
    fetch(`http://${window.location.hostname}:3000/api/config/${macDispositivo}`)
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
          })
        );
      })
      .catch((err) => {
        console.error("Erro ao buscar configurações de limite:", err);
      });
  }, []);

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
        })
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

      // Atualiza o Gauge do Score Geral
      const alertaAtivo = data.alerta?.ativo ?? false;
      const qtdGatilhos = data.alerta?.gatilhos?.length ?? 0;
      const scoreCalculado = alertaAtivo ? Math.max(10, 100 - qtdGatilhos * 25) : 100;

      setGeneralMedia((prev) => ({ ...prev, currentValue: scoreCalculado }));
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <>
      <main className="dashboard">
        <section className="generalSection">
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
            <History />
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
