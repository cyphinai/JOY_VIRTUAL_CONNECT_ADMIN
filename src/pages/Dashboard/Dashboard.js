import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import "../../components/UI/ui.css";
import styles from "./Dashboard.module.css";
import { useAuth } from "../../app/auth/AuthProvider";
import { ROLES, roleLabel } from "../../app/auth/auth";
import { getGlobalOperationalStats } from "../../userTypes/superAdmin/adminControlUtils";

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
      const stats = getGlobalOperationalStats();
      return [
        { label: "Panel Admins", value: "3", note: "Roadside · Insurance · Support" },
        { label: "Open Operations", value: String(stats.roadsideOpen + stats.insuranceOpen + stats.supportLive), note: "Across all agent panels" },
        { label: "Support Alerts", value: String(stats.supportAlerts), note: "Unread in command center" },
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
    if (auth?.role === ROLES.SUPPORT_AGENT) {
      return [
        { label: "Live Emergencies", value: "4", note: "Priority-sorted queue" },
        { label: "Unread Alerts", value: "2", note: "Incoming notifications" },
        { label: "Awaiting Dispatch", value: "1", note: "Lawyer assigned, no roadside yet" },
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
            {auth?.role === ROLES.SUPER_ADMIN ? (
              <>
                <Link className="btn btnPrimary" to="/super-admin/admin-control">
                  Admin Control Center
                </Link>
                <Link className="btn" to="/roadside/requests">
                  Roadside oversight
                </Link>
                <Link className="btn" to="/insurance/quotes">
                  Insurance oversight
                </Link>
                <Link className="btn" to="/support/command-center">
                  Support oversight
                </Link>
              </>
            ) : auth?.role === ROLES.SUPPORT_AGENT ? (
              <Link className="btn btnPrimary" to="/support/command-center">
                Open Command Center
              </Link>
            ) : (
              <>
                <button className="btn btnPrimary" type="button">
                  Create / Update Profile
                </button>
                <button className="btn" type="button">
                  View Latest Requests
                </button>
                <button className="btn" type="button">
                  Export List (Mock)
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

