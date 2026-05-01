import React from "react";
import { Link } from "react-router-dom";
import styles from "./NotFound.module.css";
import "../../components/UI/ui.css";

export default function NotFound() {
  return (
    <div className={styles.wrap}>
      <div className="panel">
        <div className="panelInner">
          <div className={styles.code}>404</div>
          <div className={styles.title}>Page not found</div>
          <div className={styles.sub}>
            The page you’re looking for doesn’t exist.
          </div>
          <div className={styles.actions}>
            <Link className="btn btnPrimary" to="/dashboard">
              Go to dashboard
            </Link>
            <Link className="btn" to="/login">
              Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

