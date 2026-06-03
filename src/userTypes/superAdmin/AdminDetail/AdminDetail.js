import React, { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import styles from "./AdminDetail.module.css";
import "../../../components/UI/ui.css";
import useLocalStorageState from "../../../app/hooks/useLocalStorageState";
import { useAuth } from "../../../app/auth/AuthProvider";
import { USERS_STORAGE_KEY, DEFAULT_USERS } from "../userFormUtils";
import {
  createAuditEntry,
  getAdminWorkloadSummary,
  getOversightRoute,
  isPanelAdminType,
  KEY_AUDIT_LOG,
  INITIAL_AUDIT_LOG,
  userTypeLabel,
} from "../adminControlUtils";
import {
  KEY_REQUESTS as ROADSIDE_KEY,
  INITIAL_REQUESTS as ROADSIDE_INITIAL,
} from "../../roadsideAssistanceAgent/roadsideStorage";
import {
  KEY_REQUESTS as INSURANCE_KEY,
  INITIAL_REQUESTS as INSURANCE_INITIAL,
} from "../../insuranceAgent/insuranceStorage";
import {
  KEY_EMERGENCIES,
  KEY_ALERTS,
  INITIAL_EMERGENCIES,
  INITIAL_ALERTS,
  sortEmergenciesByPriority,
} from "../../supportAgent/supportStorage";
import { ROLES } from "../../../app/auth/auth";

function StatusBadge({ status }) {
  const cls =
    status === "active"
      ? "badge badgeOk"
      : status === "pending"
        ? "badge badgeWarn"
        : "badge badgeDanger";
  return <span className={cls}>{status}</span>;
}

export default function AdminDetail() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { auth, impersonateAdmin } = useAuth();
  const [tab, setTab] = useState("account");
  const [users, setUsers] = useLocalStorageState(USERS_STORAGE_KEY, DEFAULT_USERS);
  const [auditLog, setAuditLog] = useLocalStorageState(KEY_AUDIT_LOG, INITIAL_AUDIT_LOG);
  const [newPassword, setNewPassword] = useState("");
  const [passwordMsg, setPasswordMsg] = useState("");

  const [roadsideRequests, setRoadsideRequests] = useLocalStorageState(ROADSIDE_KEY, ROADSIDE_INITIAL);
  const [insuranceRequests, setInsuranceRequests] = useLocalStorageState(INSURANCE_KEY, INSURANCE_INITIAL);
  const [emergencies, setEmergencies] = useLocalStorageState(KEY_EMERGENCIES, INITIAL_EMERGENCIES);
  const [alerts, setAlerts] = useLocalStorageState(KEY_ALERTS, INITIAL_ALERTS);

  const user = useMemo(() => users.find((u) => u.id === userId), [users, userId]);
  const sortedEmergencies = useMemo(() => sortEmergenciesByPriority(emergencies), [emergencies]);

  const logAction = (action, target) => {
    setAuditLog((prev) => [
      createAuditEntry({ actor: auth?.name, action, target: target || user?.name }),
      ...prev,
    ]);
  };

  if (!user || !isPanelAdminType(user.type)) {
    return (
      <div className={styles.wrap}>
        <p className={styles.muted}>Panel admin not found.</p>
        <Link className="btn btnPrimary" to="/super-admin/admin-control">
          Back to Admin Control
        </Link>
      </div>
    );
  }

  const toggleStatus = () => {
    const next = user.status === "active" ? "disabled" : "active";
    setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, status: next } : u)));
    logAction(`${next === "active" ? "Enabled" : "Disabled"} admin account`);
  };

  const resetPassword = (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setPasswordMsg("Password must be at least 6 characters.");
      return;
    }
    setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, password: newPassword } : u)));
    setNewPassword("");
    setPasswordMsg("Password updated.");
    logAction("Reset admin password");
  };

  const onImpersonate = () => {
    if (user.status === "disabled") {
      window.alert("Enable this account before impersonating.");
      return;
    }
    impersonateAdmin(user);
    logAction("Started impersonating admin");
    navigate(getOversightRoute(user.type) || "/dashboard");
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.breadcrumb}>
        <Link className={styles.breadcrumbLink} to="/super-admin/admin-control">
          ← Admin Control
        </Link>
        <span className={styles.breadcrumbSep}>/</span>
        <span className={styles.breadcrumbCurrent}>{user.name}</span>
      </div>

      <div className="panel">
        <div className="panelHeader">
          <div>
            <h2 className="panelTitle">{user.name}</h2>
            <p className="panelSub">{userTypeLabel(user.type)} · {getAdminWorkloadSummary(user.type)}</p>
          </div>
          <div className={styles.headerActions}>
            <button type="button" className="btn btnPrimary" onClick={onImpersonate}>
              Impersonate
            </button>
            <Link className="btn" to={getOversightRoute(user.type) || "#"}>
              Open panel
            </Link>
            <Link className="btn" to={`/super-admin/users/${user.id}/edit`}>
              Edit profile
            </Link>
            <button type="button" className="btn" onClick={toggleStatus}>
              {user.status === "active" ? "Disable account" : "Enable account"}
            </button>
          </div>
        </div>
        <div className="panelInner">
          <div className={styles.tabs}>
            <button
              type="button"
              className={tab === "account" ? styles.tabActive : styles.tab}
              onClick={() => setTab("account")}
            >
              Account
            </button>
            <button
              type="button"
              className={tab === "operations" ? styles.tabActive : styles.tab}
              onClick={() => setTab("operations")}
            >
              Operations
            </button>
            <button
              type="button"
              className={tab === "audit" ? styles.tabActive : styles.tab}
              onClick={() => setTab("audit")}
            >
              Audit log
            </button>
          </div>

          {tab === "account" ? (
            <div className={styles.grid}>
              <div className={styles.kv}>
                <div className={styles.k}>User ID</div>
                <div className={`${styles.v} ${styles.mono}`}>{user.id}</div>
              </div>
              <div className={styles.kv}>
                <div className={styles.k}>Email</div>
                <div className={styles.v}>{user.email || "—"}</div>
              </div>
              <div className={styles.kv}>
                <div className={styles.k}>Status</div>
                <div className={styles.v}>
                  <StatusBadge status={user.status} />
                </div>
              </div>
              <div className={styles.kv}>
                <div className={styles.k}>Type</div>
                <div className={styles.v}>{userTypeLabel(user.type)}</div>
              </div>
              <form className={styles.field} onSubmit={resetPassword} style={{ gridColumn: "1 / -1" }}>
                <label className={styles.label} htmlFor="newPassword">
                  Reset password
                </label>
                <input
                  id="newPassword"
                  className="input"
                  type="password"
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    setPasswordMsg("");
                  }}
                  placeholder="New password (min 6 chars)"
                />
                {passwordMsg ? <div className={styles.muted}>{passwordMsg}</div> : null}
                <button type="submit" className="btn btnPrimary">
                  Update password
                </button>
              </form>
            </div>
          ) : null}

          {tab === "operations" ? (
            <div>
              {user.type === ROLES.ROAD_ASSIST_AGENT ? (
                <div className="tableWrap">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Client</th>
                        <th>Service</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {roadsideRequests.map((r) => (
                        <tr key={r.id}>
                          <td>{r.id}</td>
                          <td>{r.clientName}</td>
                          <td>{r.serviceName || r.issue}</td>
                          <td>{r.status}</td>
                          <td>
                            <div className={styles.rowActions}>
                              {r.status === "new" ? (
                                <button
                                  type="button"
                                  className="btn btnPrimary"
                                  onClick={() => {
                                    setRoadsideRequests((prev) =>
                                      prev.map((x) =>
                                        x.id === r.id ? { ...x, status: "in_progress" } : x
                                      )
                                    );
                                    logAction(`Accepted roadside request ${r.id}`);
                                  }}
                                >
                                  Accept
                                </button>
                              ) : null}
                              {r.status === "in_progress" ? (
                                <button
                                  type="button"
                                  className="btn"
                                  onClick={() => {
                                    setRoadsideRequests((prev) =>
                                      prev.map((x) => (x.id === r.id ? { ...x, status: "closed" } : x))
                                    );
                                    logAction(`Closed roadside request ${r.id}`);
                                  }}
                                >
                                  Close
                                </button>
                              ) : null}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : null}

              {user.type === ROLES.INSURANCE_AGENT ? (
                <div className="tableWrap">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Client</th>
                        <th>Vehicle</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {insuranceRequests.map((r) => (
                        <tr key={r.id}>
                          <td>{r.id}</td>
                          <td>{r.clientName}</td>
                          <td>{r.vehicle}</td>
                          <td>{r.status}</td>
                          <td>
                            <div className={styles.rowActions}>
                              {r.status !== "quoted" ? (
                                <>
                                  <button
                                    type="button"
                                    className="btn"
                                    onClick={() => {
                                      setInsuranceRequests((prev) =>
                                        prev.map((x) =>
                                          x.id === r.id ? { ...x, status: "in_review" } : x
                                        )
                                      );
                                      logAction(`Marked quote ${r.id} in review`);
                                    }}
                                  >
                                    In review
                                  </button>
                                  <button
                                    type="button"
                                    className="btn btnPrimary"
                                    onClick={() => {
                                      setInsuranceRequests((prev) =>
                                        prev.map((x) => (x.id === r.id ? { ...x, status: "quoted" } : x))
                                      );
                                      logAction(`Marked quote ${r.id} as quoted`);
                                    }}
                                  >
                                    Mark quoted
                                  </button>
                                </>
                              ) : null}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : null}

              {user.type === ROLES.SUPPORT_AGENT ? (
                <>
                  <h3 className="panelTitle" style={{ marginBottom: 10 }}>
                    Live emergencies
                  </h3>
                  <div className="tableWrap" style={{ marginBottom: 16 }}>
                    <table className="table">
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Priority</th>
                          <th>Client</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sortedEmergencies.map((e) => (
                          <tr key={e.id}>
                            <td>{e.id}</td>
                            <td>{e.priority}</td>
                            <td>{e.clientName}</td>
                            <td>{e.status}</td>
                            <td>
                              {e.status !== "resolved" ? (
                                <button
                                  type="button"
                                  className="btn"
                                  onClick={() => {
                                    setEmergencies((prev) =>
                                      prev.map((x) =>
                                        x.id === e.id ? { ...x, status: "resolved" } : x
                                      )
                                    );
                                    logAction(`Resolved emergency ${e.id}`);
                                  }}
                                >
                                  Resolve
                                </button>
                              ) : (
                                "—"
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <h3 className="panelTitle" style={{ marginBottom: 10 }}>
                    Alerts ({alerts.filter((a) => !a.read).length} unread)
                  </h3>
                  <button
                    type="button"
                    className="btn"
                    onClick={() => {
                      setAlerts((prev) => prev.map((a) => ({ ...a, read: true })));
                      logAction("Marked all support alerts as read");
                    }}
                  >
                    Mark all alerts read
                  </button>
                </>
              ) : null}
            </div>
          ) : null}

          {tab === "audit" ? (
            <div className={styles.auditList}>
              {auditLog.map((entry) => (
                <div key={entry.id} className={styles.auditItem}>
                  <div className={styles.auditAction}>{entry.action}</div>
                  <div className={styles.auditMeta}>
                    {entry.actor} · {entry.target} · {entry.at}
                  </div>
                </div>
              ))}
              {auditLog.length === 0 ? <div className={styles.muted}>No audit entries yet.</div> : null}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
