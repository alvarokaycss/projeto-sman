import React, { useState, useEffect } from "react";
import { GaugeComponent } from "react-gauge-component";
import style from "./style.module.css";

export function GaugeChart({ value, min, max, metric, symbol }) {
  const maxValue = Math.round(max * 1.33);
  const lowValue = Math.round((min * 100) / maxValue);
  const highValue = Math.round((max * 100) / maxValue);

  const metricLetters = String(metric || "").split("");
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

  return (
    <div className={style.gaugeComponent}>
      <div className={style.gaugeChart}>
        {isVisible && (
          <GaugeComponent
            style={{ overflow: "visible" }}
            value={Math.round((value * 100) / maxValue)}
            type="grafana"
            minValue={0}
            maxValue={100}
            arc={{
              width: 0.1,
              padding: 0,
              cornerRadius: 0,
              subArcs: [
                { limit: lowValue, color: "#491eb7" },
                { limit: lowValue + 10, color: "#0bc0f2" },
                { limit: highValue - 10, color: "#52ff58" },
                { limit: highValue, color: "#e7ff30" },
                { color: "#e51b54" },
              ],
              padEndpoints: false,
              outerArc: { width: 20, padding: 0 },
              emptyColor: "#240b2e",
              subArcsStrokeWidth: 3.5,
              subArcsStrokeColor: "#240b2e",
            }}
            pointer={{
              type: "needle",
              color: "#240b2e",
              length: 1.3,
              width: 0.1,
              baseColor: "#240b2e",
              strokeWidth: 4,
              strokeColor: "#240b2e",
              animate: true,
              animationDuration: 500,
            }}
            labels={{
              valueLabel: { hide: true },
              tickLabels: {
                type: "inner",
                defaultTickValueConfig: { hide: true },
                defaultTickLineConfig: {
                  color: "#240b2e",
                  length: 10,
                  width: 3.5,
                  hide: false,
                  distanceFromArc: 0,
                  distanceFromText: 0,
                },
                ticks: [{ value: lowValue }, { value: highValue }],
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

      <h1 className={style.metricLabel}>
        {metricLetters.map((char, index) => (
          <span key={index}>{char}</span>
        ))}
      </h1>
    </div>
  );
}
