import React, { useMemo, useState } from "react";
import styles from "./CommandCenter.module.css";
import "../../../components/UI/ui.css";
import useLocalStorageState from "../../../app/hooks/useLocalStorageState";
import {
  AVAILABLE_LAWYERS,
  AVAILABLE_ROADSIDE_AGENTS,
  INITIAL_ALERTS,
  INITIAL_EMERGENCIES,
  KEY_ALERTS,
  KEY_EMERGENCIES,
  appendTimelineEntry,
  priorityLabel,
  sortEmergenciesByPriority,
  statusLabel,
  withEmergencyDefaults,
} from "../supportStorage";

function PriorityBadge({ priority }) {
  const cls =
    priority === "critical"
      ? "badge badgeDanger"
      : priority === "high"
        ? "badge badgeWarn"
        : "badge";
  return <span className={cls}>{priorityLabel(priority)}</span>;
}

function StatusBadge({ status }) {
  const cls =
    status === "resolved"
      ? "badge badgeOk"
      : status === "open"
        ? "badge badgeWarn"
        : "badge";
  return <span className={cls}>{statusLabel(status)}</span>;
}

export default function CommandCenter() {
  const [emergencies, setEmergencies] = useLocalStorageState(KEY_EMERGENCIES, INITIAL_EMERGENCIES);
  const [alerts, setAlerts] = useLocalStorageState(KEY_ALERTS, INITIAL_ALERTS);
  const [selectedId, setSelectedId] = useState(null);
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [lawyerPick, setLawyerPick] = useState("");
  const [agentPick, setAgentPick] = useState("");

  const sortedQueue = useMemo(() => {
    const filtered =
      priorityFilter === "all"
        ? emergencies
        : emergencies.filter((e) => e.priority === priorityFilter);
    return sortEmergenciesByPriority(filtered);
  }, [emergencies, priorityFilter]);

  const selected = useMemo(() => {
    const found = emergencies.find((e) => e.id === selectedId);
    return found ? withEmergencyDefaults(found) : null;
  }, [emergencies, selectedId]);

  const unreadAlerts = alerts.filter((a) => !a.read);

  const selectEmergency = (id) => {
    setSelectedId(id);
    const em = emergencies.find((e) => e.id === id);
    setLawyerPick(em?.assignedLawyerId || "");
    setAgentPick(em?.dispatchedAgentId || "");
    setAlerts((prev) =>
      prev.map((a) => (a.emergencyId === id ? { ...a, read: true } : a))
    );
  };

  const updateEmergency = (id, updater) => {
    setEmergencies((prev) =>
      prev.map((e) => {
        if (e.id !== id) return e;
        const next = typeof updater === "function" ? updater(e) : { ...e, ...updater };
        return next;
      })
    );
  };

  const assignLawyer = () => {
    if (!selected || !lawyerPick) return;
    const lawyer = AVAILABLE_LAWYERS.find((l) => l.id === lawyerPick);
    if (!lawyer) return;

    updateEmergency(selected.id, (e) => ({
      ...e,
      assignedLawyerId: lawyer.id,
      assignedLawyerName: lawyer.name,
      status: e.status === "open" ? "lawyer_assigned" : e.status,
      timeline: appendTimelineEntry(e.timeline, {
        actor: "Support Agent",
        note: `Lawyer assigned: ${lawyer.name}.`,
      }),
    }));

    setAlerts((prev) => [
      {
        id: `AL-${Date.now()}`,
        emergencyId: selected.id,
        message: `Lawyer ${lawyer.name} assigned to ${selected.id}`,
        severity: selected.priority,
        createdAt: "Just now",
        read: true,
      },
      ...prev,
    ]);
  };

  const dispatchRoadside = () => {
    if (!selected || !agentPick) return;
    const agent = AVAILABLE_ROADSIDE_AGENTS.find((a) => a.id === agentPick);
    if (!agent) return;

    updateEmergency(selected.id, (e) => ({
      ...e,
      dispatchedAgentId: agent.id,
      dispatchedAgentName: agent.name,
      status: "dispatched",
      timeline: appendTimelineEntry(e.timeline, {
        actor: "Support Agent",
        note: `Roadside dispatched: ${agent.name}.`,
      }),
    }));

    setAlerts((prev) => [
      {
        id: `AL-${Date.now()}`,
        emergencyId: selected.id,
        message: `Roadside agent ${agent.name} dispatched for ${selected.id}`,
        severity: selected.priority,
        createdAt: "Just now",
        read: true,
      },
      ...prev,
    ]);
  };

  const markResolved = () => {
    if (!selected) return;
    updateEmergency(selected.id, (e) => ({
      ...e,
      status: "resolved",
      timeline: appendTimelineEntry(e.timeline, {
        actor: "Support Agent",
        note: "Emergency marked resolved.",
      }),
    }));
  };

  const markAllAlertsRead = () => {
    setAlerts((prev) => prev.map((a) => ({ ...a, read: true })));
  };

  return (
    <div className={styles.wrap}>
      <div className="grid3">
        <div className="panel">
          <div className="panelInner">
            <div className={styles.detailLabel}>Live queue</div>
            <div className={styles.detailValue} style={{ fontSize: 26, fontWeight: 800 }}>
              {emergencies.filter((e) => e.status !== "resolved").length}
            </div>
          </div>
        </div>
        <div className="panel">
          <div className="panelInner">
            <div className={styles.detailLabel}>Incoming alerts</div>
            <div className={styles.detailValue} style={{ fontSize: 26, fontWeight: 800 }}>
              {unreadAlerts.length}
            </div>
          </div>
        </div>
        <div className="panel">
          <div className="panelInner">
            <div className={styles.detailLabel}>Critical / high priority</div>
            <div className={styles.detailValue} style={{ fontSize: 26, fontWeight: 800 }}>
              {emergencies.filter((e) => e.priority === "critical" || e.priority === "high").length}
            </div>
          </div>
        </div>
      </div>

      <div className={styles.layout}>
        <div className={"panel " + styles.alertsPanel}>
          <div className="panelHeader">
            <div>
              <h2 className="panelTitle">Incoming alerts</h2>
              <p className="panelSub">{unreadAlerts.length} unread</p>
            </div>
            <button type="button" className="btn" onClick={markAllAlertsRead}>
              Mark all read
            </button>
          </div>
          <div className="panelInner">
            <div className={styles.alertList}>
              {alerts.map((alert) => (
                <button
                  key={alert.id}
                  type="button"
                  className={
                    alert.read ? styles.alertItem : `${styles.alertItem} ${styles.alertItemUnread}`
                  }
                  onClick={() => selectEmergency(alert.emergencyId)}
                >
                  <div className={styles.alertMeta}>
                    <PriorityBadge priority={alert.severity} />
                    <span className={styles.alertTime}>{alert.createdAt}</span>
                  </div>
                  <div className={styles.alertMessage}>{alert.message}</div>
                </button>
              ))}
              {alerts.length === 0 ? <div className={styles.emptyState}>No alerts.</div> : null}
            </div>
          </div>
        </div>

        <div className={"panel " + styles.queuePanel}>
          <div className="panelHeader">
            <div>
              <h2 className="panelTitle">Live emergency queue</h2>
              <p className="panelSub">Sorted by emergency priority (critical first)</p>
            </div>
            <div className={styles.tools}>
              <select
                className="select"
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                aria-label="Filter by priority"
              >
                <option value="all">All priorities</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>
          <div className="panelInner">
            <div className="tableWrap">
              <table className="table">
                <thead>
                  <tr>
                    <th style={{ width: 100 }}>ID</th>
                    <th style={{ width: 100 }}>Priority</th>
                    <th>Client</th>
                    <th>Type</th>
                    <th>Location</th>
                    <th style={{ width: 120 }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedQueue.map((e) => (
                    <tr
                      key={e.id}
                      className={
                        selectedId === e.id
                          ? `${styles.queueRow} ${styles.queueRowActive}`
                          : styles.queueRow
                      }
                      onClick={() => selectEmergency(e.id)}
                    >
                      <td>{e.id}</td>
                      <td>
                        <PriorityBadge priority={e.priority} />
                      </td>
                      <td>{e.clientName}</td>
                      <td>{e.type}</td>
                      <td>{e.location}</td>
                      <td>
                        <StatusBadge status={e.status} />
                      </td>
                    </tr>
                  ))}
                  {sortedQueue.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ color: "var(--muted)" }}>
                        No emergencies in queue.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className={"panel " + styles.detailPanel}>
          <div className="panelHeader">
            <div>
              <h2 className="panelTitle">Case actions</h2>
              <p className="panelSub">Lawyer assignment, roadside dispatch, timeline</p>
            </div>
          </div>
          <div className="panelInner">
            {selected ? (
              <div className={styles.detailBody}>
                <div className={styles.detailBlock}>
                  <div className={styles.detailLabel}>Emergency</div>
                  <div className={styles.detailValue}>
                    <strong>{selected.id}</strong> · {selected.type}
                    <br />
                    {selected.clientName}
                    <br />
                    {selected.location}
                  </div>
                  <div style={{ marginTop: 10, display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <PriorityBadge priority={selected.priority} />
                    <StatusBadge status={selected.status} />
                  </div>
                  <div className={styles.detailValue} style={{ marginTop: 10 }}>
                    {selected.description}
                  </div>
                </div>

                <div className={styles.detailBlock}>
                  <div className={styles.detailLabel}>Lawyer assignment</div>
                  <div className={styles.assignRow}>
                    <select
                      className="select"
                      value={lawyerPick}
                      onChange={(e) => setLawyerPick(e.target.value)}
                    >
                      <option value="">— Select lawyer —</option>
                      {AVAILABLE_LAWYERS.map((l) => (
                        <option key={l.id} value={l.id}>
                          {l.name}
                        </option>
                      ))}
                    </select>
                    <div className={styles.assignActions}>
                      <button type="button" className="btn btnPrimary" onClick={assignLawyer}>
                        Assign lawyer
                      </button>
                    </div>
                    {selected.assignedLawyerName ? (
                      <div className={styles.detailValue}>Assigned: {selected.assignedLawyerName}</div>
                    ) : null}
                  </div>
                </div>

                <div className={styles.detailBlock}>
                  <div className={styles.detailLabel}>Roadside dispatch</div>
                  <div className={styles.assignRow}>
                    <select
                      className="select"
                      value={agentPick}
                      onChange={(e) => setAgentPick(e.target.value)}
                    >
                      <option value="">— Select agent —</option>
                      {AVAILABLE_ROADSIDE_AGENTS.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.name}
                        </option>
                      ))}
                    </select>
                    <div className={styles.assignActions}>
                      <button type="button" className="btn btnPrimary" onClick={dispatchRoadside}>
                        Dispatch roadside
                      </button>
                    </div>
                    {selected.dispatchedAgentName ? (
                      <div className={styles.detailValue}>Dispatched: {selected.dispatchedAgentName}</div>
                    ) : null}
                  </div>
                </div>

                <div className={styles.detailBlock}>
                  <div className={styles.detailLabel}>Timeline log</div>
                  <div className={styles.timeline}>
                    {[...(selected.timeline || [])].reverse().map((entry) => (
                      <div key={entry.id} className={styles.timelineItem}>
                        <div className={styles.timelineDot} />
                        <div>
                          <div className={styles.timelineNote}>{entry.note}</div>
                          <div className={styles.timelineMeta}>
                            {entry.actor} · {entry.at}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {selected.status !== "resolved" ? (
                  <button type="button" className="btn" onClick={markResolved}>
                    Mark resolved
                  </button>
                ) : null}
              </div>
            ) : (
              <div className={styles.emptyState}>
                Select an emergency from the queue or an incoming alert to assign resources and view the
                timeline.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
