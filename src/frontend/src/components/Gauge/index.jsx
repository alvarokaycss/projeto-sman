import React, { useState, useEffect } from "react";
import { GaugeComponent } from "react-gauge-component";
import style from "./style.module.css";

export function GaugeChart({ value, min, max, metric, symbol }) {
  const multiplier = metric === "Nível de Conforto" ? 1 : 1.33;
  const maxValue = Math.round(max * multiplier) || 100;
  const lowValue = Math.round((min * 100) / maxValue);
  const highValue = Math.round((max * 100) / maxValue);

  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        setIsVisible(false);
        setTimeout(() => setIsVisible(true), 50);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  // Lógica de indicativo de conformidade dinâmico baseada nos limites reais do banco
  let statusText = "CONFORTÁVEL";
  let statusClass = style.statusIdeal;
  let subArcsConfig = [];

  if (metric === "Nível de Conforto") {
    if (value === 100) {
      statusText = "EXCELENTE";
      statusClass = style.statusIdeal;
    } else if (value >= 70) {
      statusText = "MODERADO";
      statusClass = style.statusAtencao;
    } else {
      statusText = "ALERTA";
      statusClass = style.statusAlerta;
    }


    const scoreLimitLow = Math.round((50 * 100) / maxValue);
    const scoreLimitHigh = Math.round((80 * 100) / maxValue);
    subArcsConfig = [
      { limit: scoreLimitLow, color: "#e51b54" },
      { limit: scoreLimitHigh, color: "#e7ff30" },
      { color: "#52ff58" }
    ];

  } else if (metric === "Qualidade do Ar") {
    if (value <= 2) {
      statusText = "EXCELENTE";
      statusClass = style.statusIdeal;
    } else if (value === 3) {
      statusText = "MODERADO";
      statusClass = style.statusAtencao;
    } else {
      statusText = "ALERTA";
      statusClass = style.statusAlerta;
    }

    const aqiLimit1 = Math.round((2 * 100) / maxValue);
    const aqiLimit2 = Math.round((3 * 100) / maxValue);
    subArcsConfig = [
      { limit: aqiLimit1, color: "#52ff58" },
      { limit: aqiLimit2, color: "#e7ff30" },
      { color: "#e51b54" }
    ];

  } else {
    // Para temperatura, umidade, CO2, ruído, luminosidade
    // Usamos os limites reais passados de forma dinâmica pelo Postgres
    const isBaixo = min !== undefined && value < min;
    const isAlto = max !== undefined && value > max;

    if (isBaixo) {
      statusText = "ABAIXO DO LIMITE";
      statusClass = style.statusAlerta;
    } else if (isAlto) {
      statusText = "ACIMA DO LIMITE";
      statusClass = style.statusAlerta;
    } else {
      statusText = "CONFORTÁVEL";
      statusClass = style.statusIdeal;
    }

    // Configuração de 3 zonas físicas reais:
    // Zone 1: Abaixo do Mínimo de Conforto (Azul)
    const zone1 = Math.max(0, Math.min(lowValue, 98));
    // Zone 2: Dentro da Faixa de Conforto (Verde)
    const zone2 = Math.max(zone1, Math.min(highValue, 99));

    subArcsConfig = [
      { limit: zone1, color: "#052aa5ff" },
      { limit: zone2, color: "#52ff58" },
      { color: "#e51b54" }
    ];
  }

  return (
    <div className={style.gaugeComponent}>

      <h1 className={style.metricLabel}>{metric}</h1>

      <div className={style.gaugeChart}>
        {isVisible && (
          <GaugeComponent
            style={{ overflow: "visible" }}
            value={Math.round((value * 100) / maxValue)}
            type="grafana"
            minValue={0}
            maxValue={100}
            arc={{
              width: 0.3,
              padding: 0,
              cornerRadius: 0,
              subArcs: subArcsConfig,
              padEndpoints: false,
              outerArc: { width: 7, padding: 0 },
              emptyColor: "#240b2e",
              subArcsStrokeWidth: 3.5,
              subArcsStrokeColor: "#240b2e",
            }}
            labels={{
              valueLabel: { hide: true },
              tickLabels: {
                type: "inner",
                defaultTickValueConfig: { hide: true },
                defaultTickLineConfig: {
                  color: "#240b2e",
                  length: 10,
                  width: 2.5,
                  hide: false,
                  distanceFromArc: 0,
                  distanceFromText: 0,
                },
                ticks: [{ value: Math.round((value * 100) / maxValue) }],
                hideMinMax: true,
                autoSpaceTickLabels: false,
              },
            }}
            startAngle={-90}
            endAngle={90}
          />
        )}
        <h1 className={style.gaugeLabel}>
          {value !== undefined ? value.toFixed(1) : 0}
          <span className={style.gaugeLabelSymbol}>{symbol}</span>
        </h1>
      </div>

      <div className={`${style.statusText} ${statusClass}`}>
        {statusText}
      </div>
    </div>
  )
}
