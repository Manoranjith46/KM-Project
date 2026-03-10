import styles from "./Loader.module.css";

export default function Loader({ text }) {
  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.ring}></div>
        <div className={styles.ring}></div>
        <div className={styles.ring}></div>
        <div className={styles.ring}></div>
        <h3 className={styles.text}>{text}</h3>
      </div>
    </div>
  );
}
