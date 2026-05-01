import React, { useMemo } from "react";
import "../../components/UI/ui.css";
import styles from "./Dashboard.module.css";
import { useAuth } from "../../app/auth/AuthProvider";
import { ROLES, roleLabel } from "../../app/auth/auth";

function StatCard({ label, value, note }) {
  return (
    <div className={"panel " + styles.stat}>
      <div className="panelInner">
        <div className={styles.statLabel}>{label}</div>
        <div className={styles.statValue}>{value}</div>
        {note ? <div className={styles.statNote}>{note}</div> : null}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { auth } = useAuth();

  const cards = useMemo(() => {
    if (auth?.role === ROLES.SUPER_ADMIN) {
      return [
        { label: "Total Users", value: "1,248", note: "Mobile + Admin panel users" },
        { label: "Active Agents", value: "84", note: "Roadside + Insurance" },
        { label: "Open Requests", value: "36", note: "Assistance + Quotes" },
      ];
    }
    if (auth?.role === ROLES.ROAD_ASSIST_AGENT) {
      return [
        { label: "New Assistance Requests", value: "12", note: "Last 24 hours" },
        { label: "In Progress", value: "7", note: "Assigned to you" },
        { label: "Services Listed", value: "5", note: "Editable anytime" },
      ];
    }
    if (auth?.role === ROLES.INSURANCE_AGENT) {
      return [
        { label: "New Quote Requests", value: "9", note: "Last 24 hours" },
        { label: "Pending Follow-up", value: "4", note: "Requires response" },
        { label: "Quotes Sent", value: "18", note: "This month" },
      ];
    }
    return [{ label: "Status", value: "Ready", note: "" }];
  }, [auth?.role]);

  return (
    <div className={styles.wrap}>
      <div className={"panel " + styles.hero}>
        <div className="panelInner">
          <div className={styles.heroTitle}>Dashboard</div>
          <div className={styles.heroSub}>
            Logged in as <span className={styles.heroRole}>{roleLabel(auth?.role)}</span>
          </div>
        </div>
      </div>

      <div className="grid3">
        {cards.map((c) => (
          <StatCard key={c.label} {...c} />
        ))}
      </div>

      <div className={"panel " + styles.panel}>
        <div className="panelHeader">
          <div>
            <h2 className="panelTitle">Quick actions</h2>
            <p className="panelSub">Common shortcuts for this role (UI only)</p>
          </div>
        </div>
        <div className="panelInner">
          <div className={styles.actions}>
            <button className="btn btnPrimary" type="button">
              Create / Update Profile
            </button>
            <button className="btn" type="button">
              View Latest Requests
            </button>
            <button className="btn" type="button">
              Export List (Mock)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

