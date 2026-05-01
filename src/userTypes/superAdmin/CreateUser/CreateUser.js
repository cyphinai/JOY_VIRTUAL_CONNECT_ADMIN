import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import styles from "./CreateUser.module.css";
import "../../../components/UI/ui.css";
import useLocalStorageState from "../../../app/hooks/useLocalStorageState";
import {
  USERS_STORAGE_KEY,
  USER_TYPE_OPTIONS,
  DEFAULT_USERS,
  needsLoginCredentials,
  validateUser,
  toUserFromForm,
} from "../userFormUtils";

export default function CreateUser() {
  const navigate = useNavigate();
  const [users, setUsers] = useLocalStorageState(USERS_STORAGE_KEY, DEFAULT_USERS);
  const [form, setForm] = useState({
    id: "U-" + Math.floor(1000 + Math.random() * 9000),
    name: "",
    type: "client",
    status: "active",
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});

  const onChange = (key) => (e) => {
    const val = e.target.value;
    setForm((p) => ({ ...p, [key]: val }));
    setErrors((p) => ({ ...p, [key]: undefined }));
  };

  const onSubmit = (e) => {
    e.preventDefault();
    const { valid, errors: e2 } = validateUser(form, {
      users,
      editingId: null,
      mode: "create",
    });
    setErrors(e2);
    if (!valid) return;

    const u = toUserFromForm(form, { mode: "create" });
    setUsers((prev) => [u, ...prev]);
    navigate(`/super-admin/users/${u.id}`, { replace: true });
  };

  const showCreds = needsLoginCredentials(form.type);

  return (
    <div className={styles.wrap}>
      <div className={styles.breadcrumb}>
        <Link className={styles.breadcrumbLink} to="/super-admin/users">
          ← Users
        </Link>
        <span className={styles.breadcrumbSep}>/</span>
        <span className={styles.breadcrumbCurrent}>Create user</span>
      </div>

      <div className="panel">
        <div className="panelHeader">
          <div>
            <h2 className="panelTitle">Create user</h2>
            <p className="panelSub">
              For Super Admin and agents, set email and password so they can sign in. Client / lawyer records are for
              mobile app reference (optional email).
            </p>
          </div>
        </div>
        <div className="panelInner">
          <form onSubmit={onSubmit} className={styles.form}>
            <div className="grid2">
              <div className={styles.field}>
                <label className={styles.label} htmlFor="c-id">
                  User ID
                </label>
                <input id="c-id" className="input" value={form.id} onChange={onChange("id")} />
                {errors.id ? <div className={styles.error}>{errors.id}</div> : null}
              </div>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="c-name">
                  Name
                </label>
                <input
                  id="c-name"
                  className="input"
                  value={form.name}
                  onChange={onChange("name")}
                  placeholder="Full name"
                />
                {errors.name ? <div className={styles.error}>{errors.name}</div> : null}
              </div>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="c-type">
                  User type
                </label>
                <select id="c-type" className="select" value={form.type} onChange={onChange("type")}>
                  {USER_TYPE_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
                {errors.type ? <div className={styles.error}>{errors.type}</div> : null}
              </div>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="c-st">
                  Status
                </label>
                <select id="c-st" className="select" value={form.status} onChange={onChange("status")}>
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                  <option value="disabled">Disabled</option>
                </select>
                {errors.status ? <div className={styles.error}>{errors.status}</div> : null}
              </div>
            </div>

            <div className={styles.credSection}>
              <div className={styles.credHint}>
                {showCreds
                  ? "Email and password are required for Super Admin, Roadside Agent, and Insurance Agent (panel login)."
                  : "Email is optional. Password is not used for client / lawyer (mobile app accounts). You can set them if you add email for reference."}
              </div>
              <div className="grid2">
                <div className={styles.field}>
                  <label className={styles.label} htmlFor="c-em">
                    Email {showCreds ? <span className={styles.req}>*</span> : "(optional)"}
                  </label>
                  <input
                    id="c-em"
                    className="input"
                    type="email"
                    value={form.email}
                    onChange={onChange("email")}
                    placeholder="name@company.com"
                    autoComplete="off"
                  />
                  {errors.email ? <div className={styles.error}>{errors.email}</div> : null}
                </div>
                <div className={styles.field}>
                  <label className={styles.label} htmlFor="c-pw">
                    Password (min 6 characters){" "}
                    {showCreds ? <span className={styles.req}>*</span> : <span className={styles.opt}>(optional)</span>}
                  </label>
                  <input
                    id="c-pw"
                    className="input"
                    type="password"
                    value={form.password}
                    onChange={onChange("password")}
                    placeholder={showCreds ? "Create a sign-in password" : "—"}
                    autoComplete="new-password"
                  />
                  {errors.password ? <div className={styles.error}>{errors.password}</div> : null}
                </div>
              </div>
            </div>

            <div className={styles.actions}>
              <Link className="btn" to="/super-admin/users">
                Cancel
              </Link>
              <button type="submit" className="btn btnPrimary">
                Create user
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
