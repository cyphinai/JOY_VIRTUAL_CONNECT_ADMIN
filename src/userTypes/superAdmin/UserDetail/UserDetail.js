import React, { useMemo, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import styles from "./UserDetail.module.css";
import "../../../components/UI/ui.css";
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

export default function UserDetail() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [users, setUsers] = useLocalStorageState(USERS_STORAGE_KEY, DEFAULT_USERS);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  const user = useMemo(() => users.find((u) => u.id === userId), [users, userId]);

  const onDelete = () => {
    setUsers((prev) => prev.filter((u) => u.id !== userId));
    navigate("/super-admin/users", { replace: true });
  };

  if (!user) {
    return (
      <div className={styles.wrap}>
        <p className={styles.muted}>User not found.</p>
        <Link className="btn btnPrimary" to="/super-admin/users">
          Back to list
        </Link>
      </div>
    );
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.breadcrumb}>
        <Link className={styles.breadcrumbLink} to="/super-admin/users">
          ← Users
        </Link>
        <span className={styles.breadcrumbSep}>/</span>
        <span className={styles.breadcrumbCurrent}>{user.id}</span>
      </div>

      <div className="panel">
        <div className="panelHeader">
          <div>
            <h2 className="panelTitle">{user.name}</h2>
            <p className="panelSub">User details</p>
          </div>
          <div className={styles.headerActions}>
            {isPanelAdminType(user.type) ? (
              <Link className="btn btnPrimary" to={`/super-admin/admin-control/${userId}`}>
                Full admin control
              </Link>
            ) : null}
            <Link className="btn" to={`/super-admin/users/${userId}/edit`}>
              Edit user
            </Link>
            {deleteConfirm ? (
              <span className={styles.confirmGroup}>
                <span className={styles.confirmText}>Delete this user?</span>
                <button type="button" className="btn" onClick={() => setDeleteConfirm(false)}>
                  No
                </button>
                <button type="button" className="btn btnDanger" onClick={onDelete}>
                  Yes, delete
                </button>
              </span>
            ) : (
              <button type="button" className="btn btnDanger" onClick={() => setDeleteConfirm(true)}>
                Delete
              </button>
            )}
          </div>
        </div>
        <div className="panelInner">
          <div className={styles.grid}>
            <div className={styles.kv}>
              <div className={styles.k}>User ID</div>
              <div className={`${styles.v} ${styles.mono}`}>{user.id}</div>
            </div>
            <div className={styles.kv}>
              <div className={styles.k}>Name</div>
              <div className={styles.v}>{user.name}</div>
            </div>
            <div className={styles.kv}>
              <div className={styles.k}>Email</div>
              <div className={styles.v}>{user.email || "—"}</div>
            </div>
            <div className={styles.kv}>
              <div className={styles.k}>Type</div>
              <div className={`${styles.v} ${styles.mono}`}>{user.type}</div>
            </div>
            <div className={styles.kv}>
              <div className={styles.k}>Status</div>
              <div className={styles.v}>
                <StatusBadge status={user.status} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
