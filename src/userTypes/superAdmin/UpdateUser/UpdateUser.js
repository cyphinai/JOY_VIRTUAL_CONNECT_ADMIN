import React, { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import styles from "./UpdateUser.module.css";
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

export default function UpdateUser() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [users, setUsers] = useLocalStorageState(USERS_STORAGE_KEY, DEFAULT_USERS);
  const [form, setForm] = useState({
    id: "",
    name: "",
    type: "client",
    status: "active",
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [notFound, setNotFound] = useState(false);
  const [previous, setPrevious] = useState(null);

  useEffect(() => {
    const u = users.find((x) => x.id === userId);
    if (!u) {
      setNotFound(true);
      return;
    }
    setNotFound(false);
    setPrevious(u);
    setForm({
      id: u.id,
      name: u.name,
      type: u.type,
      status: u.status,
      email: u.email || "",
      password: "",
    });
  }, [userId, users]);

  const onChange = (key) => (e) => {
    const val = e.target.value;
    setForm((p) => ({ ...p, [key]: val }));
    setErrors((p) => ({ ...p, [key]: undefined }));
  };

  const onSubmit = (e) => {
    e.preventDefault();
    const { valid, errors: e2 } = validateUser(form, {
      users,
      editingId: userId,
      mode: "update",
    });
    setErrors(e2);
    if (!valid) return;

    const next = toUserFromForm(form, { previous, mode: "update" });
    setUsers((prev) => prev.map((u) => (u.id === userId ? next : u)));
    if (userId !== next.id) {
      navigate(`/super-admin/users/${next.id}/edit`, { replace: true });
    } else {
      navigate(`/super-admin/users/${next.id}`, { replace: true });
    }
  };

  if (notFound) {
    return (
      <div className={styles.wrap}>
        <p className={styles.muted}>User not found.</p>
        <Link className="btn btnPrimary" to="/super-admin/users">
          Back to list
        </Link>
      </div>
    );
  }

  const showCreds = needsLoginCredentials(form.type);
  return (
    <div className={styles.wrap}>
      <div className={styles.breadcrumb}>
        <Link className={styles.breadcrumbLink} to="/super-admin/users">
          ← Users
        </Link>
        <span className={styles.breadcrumbSep}>/</span>
        <Link className={styles.breadcrumbLink} to={`/super-admin/users/${userId}`}>
          {userId}
        </Link>
        <span className={styles.breadcrumbSep}>/</span>
        <span className={styles.breadcrumbCurrent}>Edit</span>
      </div>

      <div className="panel">
        <div className="panelHeader">
          <div>
            <h2 className="panelTitle">Update user</h2>
            <p className="panelSub">Edit profile and sign-in for {userId}</p>
          </div>
        </div>
        <div className="panelInner">
          <form onSubmit={onSubmit} className={styles.form}>
            <div className="grid2">
              <div className={styles.field}>
                <label className={styles.label} htmlFor="e-id">
                  User ID
                </label>
                <input id="e-id" className="input" value={form.id} onChange={onChange("id")} />
                {errors.id ? <div className={styles.error}>{errors.id}</div> : null}
              </div>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="e-name">
                  Name
                </label>
                <input id="e-name" className="input" value={form.name} onChange={onChange("name")} />
                {errors.name ? <div className={styles.error}>{errors.name}</div> : null}
              </div>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="e-type">
                  User type
                </label>
                <select id="e-type" className="select" value={form.type} onChange={onChange("type")}>
                  {USER_TYPE_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
                {errors.type ? <div className={styles.error}>{errors.type}</div> : null}
              </div>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="e-st">
                  Status
                </label>
                <select id="e-st" className="select" value={form.status} onChange={onChange("status")}>
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                  <option value="disabled">Disabled</option>
                </select>
                {errors.status ? <div className={styles.error}>{errors.status}</div> : null}
              </div>
            </div>

            <div className="grid2">
              <div className={styles.field}>
                <label className={styles.label} htmlFor="e-em">
                  Email {showCreds ? "(login)" : "(optional)"}
                </label>
                <input
                  id="e-em"
                  className="input"
                  type="email"
                  value={form.email}
                  onChange={onChange("email")}
                />
                {errors.email ? <div className={styles.error}>{errors.email}</div> : null}
              </div>
              {showCreds ? (
                <div className={styles.field}>
                  <label className={styles.label} htmlFor="e-pw">
                    New password
                  </label>
                  <input
                    id="e-pw"
                    className="input"
                    type="password"
                    value={form.password}
                    onChange={onChange("password")}
                    placeholder="Leave blank to keep current"
                    autoComplete="new-password"
                  />
                  {errors.password ? <div className={styles.error}>{errors.password}</div> : null}
                </div>
              ) : null}
            </div>

            <div className={styles.actions}>
              <Link className="btn" to={`/super-admin/users/${userId}`}>
                Cancel
              </Link>
              <button type="submit" className="btn btnPrimary">
                Save changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
