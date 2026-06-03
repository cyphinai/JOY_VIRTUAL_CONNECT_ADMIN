import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "./AdminControl.module.css";
import "../../../components/UI/ui.css";
import Pagination from "../../../components/Pagination/Pagination";
import useLocalStorageState from "../../../app/hooks/useLocalStorageState";
import { useAuth } from "../../../app/auth/AuthProvider";
import { USERS_STORAGE_KEY, DEFAULT_USERS } from "../userFormUtils";
import {
  createAuditEntry,
  getAdminWorkloadSummary,
  getGlobalOperationalStats,
  getOversightRoute,
  isPanelAdminType,
  KEY_AUDIT_LOG,
  INITIAL_AUDIT_LOG,
  userTypeLabel,
} from "../adminControlUtils";

function StatusBadge({ status }) {
  const cls =
    status === "active"
      ? "badge badgeOk"
      : status === "pending"
        ? "badge badgeWarn"
        : "badge badgeDanger";
  return <span className={cls}>{status}</span>;
}

export default function AdminControl() {
  const navigate = useNavigate();
  const { auth, impersonateAdmin } = useAuth();
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [users, setUsers] = useLocalStorageState(USERS_STORAGE_KEY, DEFAULT_USERS);
  const [, setAuditLog] = useLocalStorageState(KEY_AUDIT_LOG, INITIAL_AUDIT_LOG);
  const [page, setPage] = useState(1);

  const stats = useMemo(() => getGlobalOperationalStats(), []);

  const admins = useMemo(() => {
    const q = query.trim().toLowerCase();
    return users.filter((u) => {
      if (!isPanelAdminType(u.type)) return false;
      const matchQ =
        !q ||
        u.name.toLowerCase().includes(q) ||
        u.id.toLowerCase().includes(q) ||
        (u.email && u.email.toLowerCase().includes(q));
      const matchType = typeFilter === "all" || u.type === typeFilter;
      return matchQ && matchType;
    });
  }, [users, query, typeFilter]);

  const pageSize = 7;
  const total = admins.length;
  const paged = useMemo(() => {
    const start = (page - 1) * pageSize;
    return admins.slice(start, start + pageSize);
  }, [admins, page]);

  const logAction = (action, target) => {
    setAuditLog((prev) => [
      createAuditEntry({ actor: auth?.name, action, target }),
      ...prev,
    ]);
  };

  const toggleStatus = (user) => {
    const next = user.status === "active" ? "disabled" : "active";
    setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, status: next } : u)));
    logAction(`${next === "active" ? "Enabled" : "Disabled"} admin account`, user.name);
  };

  const onImpersonate = (user) => {
    if (user.status === "disabled") {
      window.alert("Enable this account before impersonating.");
      return;
    }
    impersonateAdmin(user);
    logAction("Started impersonating admin", user.name);
    const route = getOversightRoute(user.type) || "/dashboard";
    navigate(route);
  };

  return (
    <div className={styles.wrap}>
      <div className="panel">
        <div className="panelHeader">
          <div>
            <h2 className="panelTitle">Admin Control Center</h2>
            <p className="panelSub">
              Full control over roadside, insurance, and support panel admins
            </p>
          </div>
          <Link to="/super-admin/users/new" className="btn btnPrimary">
            + Create admin
          </Link>
        </div>
        <div className="panelInner">
          <div className={styles.summaryGrid}>
            <div className={styles.summaryCard}>
              <div className={styles.summaryLabel}>Panel admins</div>
              <div className={styles.summaryValue}>{admins.length}</div>
            </div>
            <div className={styles.summaryCard}>
              <div className={styles.summaryLabel}>Roadside open</div>
              <div className={styles.summaryValue}>{stats.roadsideOpen}</div>
            </div>
            <div className={styles.summaryCard}>
              <div className={styles.summaryLabel}>Support live</div>
              <div className={styles.summaryValue}>{stats.supportLive}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="panel">
        <div className="panelInner">
          <div className={styles.filters}>
            <input
              className="input"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
              placeholder="Search admins..."
            />
            <select
              className="select"
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="all">All admin types</option>
              <option value="roadside_assistance_agent">Roadside</option>
              <option value="insurance_agent">Insurance</option>
              <option value="support_agent">Support</option>
            </select>
          </div>
        </div>
      </div>

      <div className="panel">
        <div className="panelInner">
          <div className="tableWrap">
            <table className="table">
              <thead>
                <tr>
                  <th style={{ width: 100 }}>ID</th>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Email</th>
                  <th style={{ width: 90 }}>Status</th>
                  <th>Workload</th>
                  <th style={{ width: 340 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paged.map((u) => (
                  <tr key={u.id}>
                    <td className={styles.mono}>{u.id}</td>
                    <td>{u.name}</td>
                    <td>{userTypeLabel(u.type)}</td>
                    <td className={styles.emailCell}>{u.email || "—"}</td>
                    <td>
                      <StatusBadge status={u.status} />
                    </td>
                    <td>{getAdminWorkloadSummary(u.type)}</td>
                    <td>
                      <div className={styles.rowActions}>
                        <Link className="btn" to={`/super-admin/admin-control/${u.id}`}>
                          Manage
                        </Link>
                        <button type="button" className="btn btnPrimary" onClick={() => onImpersonate(u)}>
                          Impersonate
                        </button>
                        <Link className="btn" to={getOversightRoute(u.type) || "#"}>
                          Open panel
                        </Link>
                        <button type="button" className="btn" onClick={() => toggleStatus(u)}>
                          {u.status === "active" ? "Disable" : "Enable"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {admins.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ color: "var(--muted)" }}>
                      No panel admins found.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
          <Pagination page={page} pageSize={pageSize} total={total} onChange={setPage} />
        </div>
      </div>
    </div>
  );
}
