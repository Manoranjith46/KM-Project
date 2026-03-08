import styles from "./Loader.module.css";

export default function Loader({ text }) {
  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* 4 Animated Rings */}
        <div className={styles.ring}></div>
        <div className={styles.ring}></div>
        <div className={styles.ring}></div>
        <div className={styles.ring}></div>
        
        {/* Dynamic Text Prop */}
        <h3 className={styles.text}>{text}</h3>
      </div>
    </div>
  );
}