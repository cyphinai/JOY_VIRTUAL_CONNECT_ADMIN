import React, { useMemo, useState } from "react";
import styles from "./AssistanceRequests.module.css";
import "../../../components/UI/ui.css";
import Modal from "../../../components/Modal/Modal";
import useLocalStorageState from "../../../app/hooks/useLocalStorageState";
import Pagination from "../../../components/Pagination/Pagination";

const INITIAL_REQUESTS = [
  {
    id: "AR-9012",
    clientName: "Client: Bilal",
    location: "DHA, Lahore",
    issue: "Car won’t start",
    createdAt: "Today, 09:15",
    status: "new",
  },
  {
    id: "AR-9008",
    clientName: "Client: Hira",
    location: "Gulshan, Karachi",
    issue: "Flat tire",
    createdAt: "Yesterday, 18:40",
    status: "in_progress",
  },
  {
    id: "AR-8999",
    clientName: "Client: Zain",
    location: "Blue Area, Islamabad",
    issue: "Battery jump needed",
    createdAt: "Yesterday, 10:02",
    status: "closed",
  },
];

function StatusBadge({ status }) {
  const label =
    status === "new" ? "New" : status === "in_progress" ? "In progress" : "Closed";
  const cls =
    status === "new"
      ? "badge badgeWarn"
      : status === "in_progress"
        ? "badge"
        : "badge badgeOk";
  return <span className={cls}>{label}</span>;
}

export default function AssistanceRequests() {
  const [status, setStatus] = useState("all");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(null);
  const [requests, setRequests] = useLocalStorageState("jvc_roadside_requests", INITIAL_REQUESTS);
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState(() => new Set());

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return requests.filter((r) => {
      const matchStatus = status === "all" || r.status === status;
      const matchQuery =
        !q ||
        r.id.toLowerCase().includes(q) ||
        r.clientName.toLowerCase().includes(q) ||
        r.location.toLowerCase().includes(q) ||
        r.issue.toLowerCase().includes(q);
      return matchStatus && matchQuery;
    });
  }, [status, query, requests]);

  const pageSize = 7;
  const total = rows.length;
  const paged = useMemo(() => {
    const start = (page - 1) * pageSize;
    return rows.slice(start, start + pageSize);
  }, [rows, page]);

  const allPageSelected = paged.length > 0 && paged.every((r) => selectedIds.has(r.id));

  const updateStatus = (id, nextStatus) => {
    setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status: nextStatus } : r)));
    setSelected((prev) => (prev?.id === id ? { ...prev, status: nextStatus } : prev));
  };

  const toggleOne = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAllOnPage = () => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allPageSelected) {
        paged.forEach((r) => next.delete(r.id));
      } else {
        paged.forEach((r) => next.add(r.id));
      }
      return next;
    });
  };

  const clearSelection = () => setSelectedIds(new Set());

  const bulkUpdate = (nextStatus) => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;
    setRequests((prev) =>
      prev.map((r) => (selectedIds.has(r.id) ? { ...r, status: nextStatus } : r))
    );
    setSelected((prev) => (prev && selectedIds.has(prev.id) ? { ...prev, status: nextStatus } : prev));
    clearSelection();
  };

  return (
    <div className={styles.wrap}>
      <div className="panel">
        <div className="panelHeader">
          <div>
            <h2 className="panelTitle">Assistance Requests</h2>
            <p className="panelSub">Forms submitted by mobile client users (UI only)</p>
          </div>
          <div className={styles.tools}>
            <input
              className="input"
              placeholder="Search requests..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
                clearSelection();
              }}
            />
            <select
              className="select"
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
                clearSelection();
              }}
            >
              <option value="all">All</option>
              <option value="new">New</option>
              <option value="in_progress">In progress</option>
              <option value="closed">Closed</option>
            </select>
          </div>
        </div>
        <div className="panelInner">
          {selectedIds.size > 0 ? (
            <div className={styles.bulkBar}>
              <div className={styles.bulkInfo}>
                <span className="badge">{selectedIds.size} selected</span>
              </div>
              <div className={styles.bulkActions}>
                <button type="button" className="btn" onClick={() => bulkUpdate("in_progress")}>
                  Mark in progress
                </button>
                <button type="button" className="btn btnPrimary" onClick={() => bulkUpdate("closed")}>
                  Mark closed
                </button>
                <button type="button" className="btn" onClick={clearSelection}>
                  Clear
                </button>
              </div>
            </div>
          ) : null}

          <div className="tableWrap">
            <table className="table">
              <thead>
                <tr>
                  <th style={{ width: 56 }}>
                    <input
                      type="checkbox"
                      aria-label="Select all on page"
                      checked={allPageSelected}
                      onChange={toggleAllOnPage}
                    />
                  </th>
                  <th style={{ width: 120 }}>Request ID</th>
                  <th>Client</th>
                  <th>Location</th>
                  <th>Issue</th>
                  <th style={{ width: 140 }}>Status</th>
                  <th style={{ width: 160 }}>Created</th>
                  <th style={{ width: 160 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paged.map((r) => (
                  <tr key={r.id}>
                    <td>
                      <input
                        type="checkbox"
                        aria-label={"Select " + r.id}
                        checked={selectedIds.has(r.id)}
                        onChange={() => toggleOne(r.id)}
                      />
                    </td>
                    <td>{r.id}</td>
                    <td>{r.clientName}</td>
                    <td>{r.location}</td>
                    <td>{r.issue}</td>
                    <td>
                      <StatusBadge status={r.status} />
                    </td>
                    <td>{r.createdAt}</td>
                    <td>
                      <div className={styles.actions}>
                        <button className="btn" type="button" onClick={() => setSelected(r)}>
                          View
                        </button>
                        {r.status === "new" ? (
                          <button
                            className="btn btnPrimary"
                            type="button"
                            onClick={() => updateStatus(r.id, "in_progress")}
                          >
                            Accept
                          </button>
                        ) : null}
                        {r.status === "in_progress" ? (
                          <button
                            className="btn btnPrimary"
                            type="button"
                            onClick={() => updateStatus(r.id, "closed")}
                          >
                            Close
                          </button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ color: "var(--muted)" }}>
                      No requests found.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>

          <Pagination page={page} pageSize={pageSize} total={total} onChange={setPage} />
        </div>
      </div>

      <Modal
        open={Boolean(selected)}
        title={selected ? `Request ${selected.id}` : ""}
        description="Client form details (mock)"
        onClose={() => setSelected(null)}
        footer={
          <>
            <button type="button" className="btn" onClick={() => setSelected(null)}>
              Close
            </button>
            {selected?.status === "new" ? (
              <button type="button" className="btn btnPrimary" onClick={() => updateStatus(selected.id, "in_progress")}>
                Mark in progress
              </button>
            ) : null}
            {selected?.status === "in_progress" ? (
              <button type="button" className="btn btnPrimary" onClick={() => updateStatus(selected.id, "closed")}>
                Mark closed
              </button>
            ) : null}
            {selected?.status === "closed" ? (
              <button type="button" className="btn" onClick={() => updateStatus(selected.id, "in_progress")}>
                Reopen
              </button>
            ) : null}
          </>
        }
      >
        {selected ? (
          <div className={styles.detailGrid}>
            <div className={styles.detailItem}>
              <div className={styles.detailLabel}>Client</div>
              <div className={styles.detailValue}>{selected.clientName}</div>
            </div>
            <div className={styles.detailItem}>
              <div className={styles.detailLabel}>Location</div>
              <div className={styles.detailValue}>{selected.location}</div>
            </div>
            <div className={styles.detailItem}>
              <div className={styles.detailLabel}>Issue</div>
              <div className={styles.detailValue}>{selected.issue}</div>
            </div>
            <div className={styles.detailItem}>
              <div className={styles.detailLabel}>Created</div>
              <div className={styles.detailValue}>{selected.createdAt}</div>
            </div>
            <div className={styles.detailItem}>
              <div className={styles.detailLabel}>Status</div>
              <div className={styles.detailValue}>
                <StatusBadge status={selected.status} />
              </div>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}

