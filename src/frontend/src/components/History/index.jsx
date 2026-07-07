import styles from "./style.module.css";
import { Log } from "../Log";

export function History({ logs = [] }) {
  return (
    <div className={styles.history}>
      <h2>HISTÓRICO DE ALERTAS</h2>
      <div className={styles.logContainer}>
        {logs.length === 0 ? (
          <div style={{ textAlign: "center", color: "#888", padding: "20px 0" }}>
            Nenhum alerta recente.
          </div>
        ) : (
          logs.map((log) => (
            <Log
              key={log.id}
              icon={log.icon}
              title={log.title}
              message={log.message}
              time={log.time}
            />
          ))
        )}
      </div>
    </div>
  );
}
