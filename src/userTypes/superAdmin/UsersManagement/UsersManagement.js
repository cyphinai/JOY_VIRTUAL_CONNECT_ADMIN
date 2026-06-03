import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import styles from "./UsersManagement.module.css";
import "../../../components/UI/ui.css";
import Pagination from "../../../components/Pagination/Pagination";
import useLocalStorageState from "../../../app/hooks/useLocalStorageState";
import { USERS_STORAGE_KEY, DEFAULT_USERS } from "../userFormUtils";
import { isPanelAdminType } from "../adminControlUtils";

function StatusBadge({ status }) {
  const cls =
    status === "active"
      ? "badge badgeOk"
      : status === "pending"
        ? "badge badgeWarn"
        : "badge badgeDanger";
  return <span className={cls}>{status}</span>;
}

export default function UsersManagement() {
  const [query, setQuery] = useState("");
  const [type, setType] = useState("all");
  const [users, setUsers] = useLocalStorageState(USERS_STORAGE_KEY, DEFAULT_USERS);
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return users.filter((u) => {
      const matchQ =
        !q ||
        u.name.toLowerCase().includes(q) ||
        u.id.toLowerCase().includes(q) ||
        (u.email && u.email.toLowerCase().includes(q));
      const matchType = type === "all" || u.type === type;
      return matchQ && matchType;
    });
  }, [query, type, users]);

  const pageSize = 7;
  const total = filtered.length;
  const paged = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page]);

  const deleteUser = (id) => {
    if (!window.confirm("Delete this user?")) return;
    setUsers((prev) => prev.filter((u) => u.id !== id));
  };

  return (
    <div className={styles.wrap}>
      <div className={"panel " + styles.header}>
        <div className="panelHeader">
          <div>
            <h2 className="panelTitle">Users Management</h2>
            <p className="panelSub">Agents and super admin include email and password for panel sign-in</p>
          </div>
          <Link to="/super-admin/users/new" className="btn btnPrimary">
            + Create user
          </Link>
          <Link to="/super-admin/admin-control" className="btn">
            Admin Control
          </Link>
        </div>
        <div className="panelInner">
          <div className={styles.filters}>
            <input
              className="input"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
              placeholder="Search by name, email, or ID..."
            />
            <select
              className="select"
              value={type}
              onChange={(e) => {
                setType(e.target.value);
                setPage(1);
              }}
            >
              <option value="all">All user types</option>
              <option value="client">Client</option>
              <option value="lawyer">Lawyer</option>
              <option value="roadside_assistance_agent">Roadside Assistance Agent</option>
              <option value="insurance_agent">Insurance Agent</option>
              <option value="support_agent">Support Agent</option>
              <option value="super_admin">Super Admin</option>
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
                  <th style={{ width: 120 }}>User ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th style={{ width: 220 }}>Type</th>
                  <th style={{ width: 100 }}>Status</th>
                  <th style={{ width: 220 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paged.map((u) => (
                  <tr key={u.id}>
                    <td>{u.id}</td>
                    <td>{u.name}</td>
                    <td className={styles.emailCell}>{u.email || "—"}</td>
                    <td className={styles.mono}>{u.type}</td>
                    <td>
                      <StatusBadge status={u.status} />
                    </td>
                    <td>
                      <div className={styles.rowActions}>
                        <Link className="btn" to={`/super-admin/users/${u.id}`}>
                          View
                        </Link>
                        {isPanelAdminType(u.type) ? (
                          <Link className="btn btnPrimary" to={`/super-admin/admin-control/${u.id}`}>
                            Control
                          </Link>
                        ) : null}
                        <Link className="btn" to={`/super-admin/users/${u.id}/edit`}>
                          Update
                        </Link>
                        <button className="btn btnDanger" type="button" onClick={() => deleteUser(u.id)}>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ color: "var(--muted)" }}>
                      No users found.
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
