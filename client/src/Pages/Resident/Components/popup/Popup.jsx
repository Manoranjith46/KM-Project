import { useEffect, useRef } from "react";
import styles from "./Popup.module.css";

export default function Popup({
  isOpen,
  onClose,
  type = "info", // 'success', 'error', 'warning', 'info', 'confirm'
  title,
  message,
  onConfirm,
  confirmText = "Confirm",
  cancelText = "Cancel"
}) {
  const overlayRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") { onClose(); return; }
      // Allow keys only inside the popup
      if (overlayRef.current && !overlayRef.current.contains(e.target)) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    window.addEventListener("keydown", handleKeyDown, true);
    return () => window.removeEventListener("keydown", handleKeyDown, true);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const renderIcon = () => {
    switch (type) {
      case "success":
        return (
          <div className={`${styles.iconWrap} ${styles.iconSuccess}`}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
        );
      case "error":
        return (
          <div className={`${styles.iconWrap} ${styles.iconError}`}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </div>
        );
      case "warning":
        return (
          <div className={`${styles.iconWrap} ${styles.iconWarning}`}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>
        );
      case "confirm":
        return (
          <div className={`${styles.iconWrap} ${styles.iconConfirm}`}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>
        );
      case "info":
      default:
        return (
          <div className={`${styles.iconWrap} ${styles.iconInfo}`}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
          </div>
        );
    }
  };

  return (
    <div className={styles.overlay} ref={overlayRef} onClick={onClose}>
      <div className={styles.popupBox} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        
        {/* Colorful top accent bar matching the Dashboard meal cards */}
        <div className={`${styles.accentBar} ${styles[`accent_${type}`]}`} />

        <button className={styles.closeBtn} onClick={onClose} aria-label="Close modal">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <div className={styles.content}>
          {renderIcon()}
          <div className={styles.textContainer}>
            {title && <h3 className={styles.title}>{title}</h3>}
            <p className={styles.message}>{message}</p>
          </div>
        </div>

        <div className={styles.actions}>
          {type === "confirm" ? (
            <>
              <button className={styles.cancelBtn} onClick={onClose}>
                {cancelText}
              </button>
              <button className={`${styles.btnBase} ${styles.btnDanger}`} onClick={onConfirm}>
                {confirmText}
              </button>
            </>
          ) : (
            <button className={`${styles.btnBase} ${styles.btnPrimary}`} onClick={onClose}>
              Got it
            </button>
          )}
        </div>

      </div>
    </div>
  );
}