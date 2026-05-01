import React, { useEffect } from "react";
import styles from "./Modal.module.css";

export default function Modal({ open, title, description, children, onClose, footer }) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className={styles.backdrop} role="dialog" aria-modal="true" aria-label={title || "Dialog"}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <div className={styles.headText}>
            {title ? <div className={styles.title}>{title}</div> : null}
            {description ? <div className={styles.desc}>{description}</div> : null}
          </div>
          <button type="button" className={styles.close} onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        <div className={styles.body}>{children}</div>

        {footer ? <div className={styles.footer}>{footer}</div> : null}
      </div>

      <button type="button" className={styles.scrimBtn} onClick={onClose} aria-label="Close dialog" />
    </div>
  );
}

