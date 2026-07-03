import React, { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import style from "./style.module.css"; // 🛠️ Importação do CSS Module

const CustomPrismaDot = (props) => {
  const { cx, cy, fill } = props;
  return (
    <polygon
      points={`${cx},${cy - 6} ${cx + 6},${cy} ${cx},${cy + 6} ${cx - 6},${cy}`}
      fill={fill}
      stroke="#240b2e"
      strokeWidth={2}
    />
  );
};

const CustomTooltip = ({ active, payload, label, linesConfig }) => {
  if (active && payload && payload.length) {
    return (
      <div className={style.tooltipContainer}>
        <p className={style.tooltipTitle}>{label}</p>
        {payload.map((pld, index) => {
          const originalDataKey = pld.dataKey.replace("_normalized", "");
          const rawValue = pld.payload[originalDataKey];

          const config =
            linesConfig.find((c) => c.dataKey === originalDataKey) || {};
          const labelLimpa = config.label || originalDataKey;
          const simbolo = config.symbol || "";

          return (
            <p
              key={index}
              className={style.tooltipLine}
              style={{ color: pld.color }} // Mantido inline pois a cor é dinâmica (cada linha tem a sua)
            >
              {`${labelLimpa}: ${rawValue !== undefined ? rawValue : "N/A"}${simbolo}`}
            </p>
          );
        })}
      </div>
    );
  }
  return null;
};

const DynamicLineChart = ({ data, linesConfig }) => {
  const [focusedLine, setFocusedLine] = useState(null);

  if (!data || !linesConfig || linesConfig.length === 0) {
    return <p>Nenhum dado disponível para análise.</p>;
  }

  const LOWER_BOUND = 25;
  const UPPER_BOUND = 75;

  const normalizedData = data.map((point) => {
    const newPoint = { ...point };
    linesConfig.forEach((line) => {
      const rawValue = point[line.dataKey];
      const { min, max } = line;
      if (rawValue !== undefined && min !== undefined && max !== undefined) {
        const range = max - min;
        let normalizedValue = LOWER_BOUND;
        if (range !== 0) {
          normalizedValue =
            LOWER_BOUND +
            ((rawValue - min) / range) * (UPPER_BOUND - LOWER_BOUND);
        }
        newPoint[`${line.dataKey}_normalized`] = normalizedValue;
      }
    });
    return newPoint;
  });

  const handleLegendClick = (e) => {
    const clickedKey = e.dataKey;
    setFocusedLine((prev) => (prev === clickedKey ? null : clickedKey));
  };

  const renderCustomAxisTick = ({ x, y, payload, index }) => {
    let textAnchor = "middle";
    if (index === 0) {
      textAnchor = "start";
    } else if (index === normalizedData.length - 1) {
      textAnchor = "end";
    }

    return (
      <g transform={`translate(${x},${y})`}>
        <text
          x={0}
          y={0}
          dy={16}
          textAnchor={textAnchor}
          fill="#240b2e"
          fontSize={14}
          fontFamily="Unica One, sans-serif"
        >
          {payload.value}
        </text>
      </g>
    );
  };

  const dadoMaisRecente = data[data.length - 1] || {};

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={normalizedData}
        margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
      >
        <CartesianGrid stroke="#240b2e00" vertical={false} />

        <XAxis
          dataKey="name"
          padding={{ left: 0, right: 0 }}
          interval={0}
          axisLine={{ stroke: "#240b2e" }}
          tickLine={{ stroke: "#240b2e" }}
          tick={renderCustomAxisTick}
        />

        <YAxis domain={[-15, 115]} tick={false} axisLine={false} width={0} />

        <Tooltip
          content={(props) => (
            <CustomTooltip {...props} linesConfig={linesConfig} />
          )}
          cursor={{ stroke: "#240b2e", strokeWidth: 1 }}
        />

        <Legend
          verticalAlign="top"
          align="center"
          onClick={handleLegendClick}
          className={style.chartLegendWrapper} // 🛠️ Classe da Legenda aplicada via Recharts
        />

        <ReferenceLine y={UPPER_BOUND} stroke="red" strokeDasharray="4 4" />
        <ReferenceLine y={LOWER_BOUND} stroke="red" strokeDasharray="4 4" />

        {linesConfig.map((line, index) => {
          const normalizedKey = `${line.dataKey}_normalized`;
          const isHidden =
            focusedLine !== null && focusedLine !== normalizedKey;

          const valorRecente = dadoMaisRecente[line.dataKey];
          const valorFormatado =
            valorRecente !== undefined ? valorRecente : "N/A";
          const simbolo = line.symbol || "";
          const legendName = `${line.label} (${valorFormatado}${simbolo})`;

          return (
            <Line
              key={index}
              type="linear"
              dataKey={normalizedKey}
              name={legendName}
              stroke={line.color || "#240b2e"}
              strokeWidth={2}
              dot={false}
              hide={isHidden}
              isAnimationActive={false}
              activeDot={<CustomPrismaDot />}
            />
          );
        })}
      </LineChart>
    </ResponsiveContainer>
  );
};

export default DynamicLineChart;
