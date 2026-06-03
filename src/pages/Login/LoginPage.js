import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./LoginPage.module.css";
import { tryLoginWithEmailPassword } from "../../app/auth/auth";
import { useAuth } from "../../app/auth/AuthProvider";
import "../../components/UI/ui.css";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, isAuthed } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  if (isAuthed) {
    navigate("/dashboard", { replace: true });
  }

  const onSubmit = (e) => {
    e.preventDefault();
    setError("");
    const result = tryLoginWithEmailPassword(email, password);
    if (result.error) {
      setError(result.error);
      return;
    }
    login(result.user);
    navigate("/dashboard", { replace: true });
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.logo} aria-hidden="true">
            JV
          </div>
          <div>
            <h1 className={styles.title}>Joy Virual Connect Admin</h1>
            <p className={styles.sub}>Sign in with the account created for you (Super Admin or agent)</p>
          </div>
        </div>

        <form onSubmit={onSubmit} className={styles.form} autoComplete="on">
          {error ? <div className={styles.errorBanner}>{error}</div> : null}
          <div className={styles.row}>
            <label className={styles.label} htmlFor="email">
              Email
            </label>
            <input
              id="email"
              className="input"
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. admin@joyvc.com"
              autoComplete="username"
            />
          </div>
          <div className={styles.row}>
            <label className={styles.label} htmlFor="password">
              Password
            </label>
            <input
              id="password"
              className="input"
              name="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </div>
          <button type="submit" className="btn btnPrimary">
            Sign in
          </button>
        </form>

        <p className={styles.demo}>
          Demo: <code>admin@joyvc.com</code> / <code>Admin@123</code> · <code>roadside@joyvc.com</code> /{" "}
          <code>Roadside@123</code> · <code>insurance@joyvc.com</code> / <code>Insurance@123</code> ·{" "}
          <code>support@joyvc.com</code> / <code>Support@123</code>
        </p>

        <div className={styles.footer}>
          <span className={styles.pill}>Local demo</span>
          <span className={styles.pill}>Names from user accounts</span>
        </div>
      </div>
    </div>
  );
}
