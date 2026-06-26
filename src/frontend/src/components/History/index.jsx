import styles from "./style.module.css";
import { Log } from "../Log";
import { useState } from "react";

export function History() {
  const [logs, setLogs] = useState([
    {
      id: 1,
      icon: "fa-solid fa-triangle-exclamation",
      title: "Aviso de Som",
      message: "Ruído acima do limite na Sala 01.",
      time: "14:32",
    },
    {
      id: 2,
      icon: "fa-solid fa-wind",
      title: "Aviso de CO₂",
      message: "Qualidade do ar interna está abafada.",
      time: "14:30",
    },
    {
      id: 3,
      icon: "fa-solid fa-temperature-high",
      title: "Aviso de Calor",
      message: "Temperatura atingiu 27°C.",
      time: "14:25",
    },
    {
      id: 4,
      icon: "fa-solid fa-temperature-high",
      title: "Aviso de Calor",
      message: "Temperatura atingiu 27°C.",
      time: "14:25",
    },
    {
      id: 5,
      icon: "fa-solid fa-temperature-high",
      title: "Aviso de Calor",
      message: "Temperatura atingiu 27°C.",
      time: "14:25",
    },
    {
      id: 6,
      icon: "fa-solid fa-temperature-high",
      title: "Aviso de Calor",
      message: "Temperatura atingiu 27°C.",
      time: "14:25",
    },
    {
      id: 7,
      icon: "fa-solid fa-temperature-high",
      title: "Aviso de Calor",
      message: "Temperatura atingiu 27°C.",
      time: "14:25",
    },
    {
      id: 8,
      icon: "fa-solid fa-temperature-high",
      title: "Aviso de Calor",
      message: "Temperatura atingiu 27°C.",
      time: "14:25",
    },
  ]);

  return (
    <div className={styles.history}>
      <h2>History</h2>
      <div className={styles.logContainer}>
        {logs.map((log) => (
          <Log
            key={log.id}
            icon={log.icon}
            title={log.title}
            message={log.message}
            time={log.time}
          />
        ))}
      </div>
    </div>
  );
}
