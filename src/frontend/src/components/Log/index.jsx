import styles from "./style.module.css";

// Usar a desestruturação { icon, title, message, time } deixa o código mais limpo que usar "props."
export function Log({ icon, title, message, time }) {
  return (
    <div className={styles.log}>
      <i className={icon}></i>
      <div className={styles.message}>
        <div className={styles.headerLog}>
          <h3>{title}</h3>
          <span className={styles.time}>{time}</span> {/* Horário do evento */}
        </div>
        <p>{message}</p>
      </div>
    </div>
  );
}
