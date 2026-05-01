import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import styles from "./QuotesRequests.module.css";
import "../../../components/UI/ui.css";
import Modal from "../../../components/Modal/Modal";
import Pagination from "../../../components/Pagination/Pagination";
import useLocalStorageState from "../../../app/hooks/useLocalStorageState";
import {
  INITIAL_QUOTES_BY_REQUEST,
  INITIAL_REQUESTS,
  KEY_QUOTES_BY_REQUEST,
  KEY_REQUESTS,
} from "../insuranceStorage";

function StatusBadge({ status }) {
  const label =
    status === "new" ? "New" : status === "in_review" ? "In review" : "Quoted";
  const cls =
    status === "new"
      ? "badge badgeWarn"
      : status === "in_review"
        ? "badge"
        : "badge badgeOk";
  return <span className={cls}>{label}</span>;
}

export default function QuotesRequests() {
  const [status, setStatus] = useState("all");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(null);
  const [requests, setRequests] = useLocalStorageState(KEY_REQUESTS, INITIAL_REQUESTS);
  const [quotesByRequestId] = useLocalStorageState(KEY_QUOTES_BY_REQUEST, INITIAL_QUOTES_BY_REQUEST);
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
        r.vehicle.toLowerCase().includes(q) ||
        r.city.toLowerCase().includes(q);
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
    if (selectedIds.size === 0) return;
    setRequests((prev) => prev.map((r) => (selectedIds.has(r.id) ? { ...r, status: nextStatus } : r)));
    setSelected((prev) => (prev && selectedIds.has(prev.id) ? { ...prev, status: nextStatus } : prev));
    clearSelection();
  };

  return (
    <div className={styles.wrap}>
      <div className="panel">
        <div className="panelHeader">
          <div>
            <h2 className="panelTitle">Quotes Requests</h2>
            <p className="panelSub">Forms from mobile clients. Compose, drafts, and sent history live on dedicated pages.</p>
          </div>
          <div className={styles.tools}>
            <input
              className="input"
              placeholder="Search quote requests..."
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
              <option value="in_review">In review</option>
              <option value="quoted">Quoted</option>
            </select>
            <Link to="/insurance/quotes/compose" className="btn btnPrimary">
              Compose quote
            </Link>
            <Link to="/insurance/quotes/sent" className="btn">
              Sent history
            </Link>
          </div>
        </div>
        <div className="panelInner">
          {selectedIds.size > 0 ? (
            <div className={styles.bulkBar}>
              <div className={styles.bulkInfo}>
                <span className="badge">{selectedIds.size} selected</span>
              </div>
              <div className={styles.bulkActions}>
                <button type="button" className="btn" onClick={() => bulkUpdate("in_review")}>
                  Mark in review
                </button>
                <button type="button" className="btn btnPrimary" onClick={() => bulkUpdate("quoted")}>
                  Mark quoted
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
                  <th>Vehicle</th>
                  <th style={{ width: 140 }}>City</th>
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
                    <td>{r.vehicle}</td>
                    <td>{r.city}</td>
                    <td>
                      <StatusBadge status={r.status} />
                    </td>
                    <td>{r.createdAt}</td>
                    <td>
                      <div className={styles.actions}>
                        <button className="btn" type="button" onClick={() => setSelected(r)}>
                          View
                        </button>
                        {r.status !== "quoted" ? (
                          <button className="btn btnPrimary" type="button" onClick={() => updateStatus(r.id, "in_review")}>
                            Mark in review
                          </button>
                        ) : (
                          <button className="btn" type="button" onClick={() => setSelected(r)}>
                            View quote
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ color: "var(--muted)" }}>
                      No quote requests found.
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
        title={selected ? `Quote Request ${selected.id}` : ""}
        description="Client form details (mock)"
        onClose={() => setSelected(null)}
        footer={
          <>
            <button type="button" className="btn" onClick={() => setSelected(null)}>
              Close
            </button>
            {selected?.status !== "quoted" ? (
              <button type="button" className="btn" onClick={() => updateStatus(selected.id, "in_review")}>
                Mark in review
              </button>
            ) : null}
            <Link
              className="btn btnPrimary"
              to={selected ? `/insurance/quotes/compose?requestId=${encodeURIComponent(selected.id)}` : "#"}
              onClick={() => selected && setSelected(null)}
            >
              {selected?.status === "quoted" ? "View / edit in composer" : "Open compose"}
            </Link>
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
              <div className={styles.detailLabel}>Vehicle</div>
              <div className={styles.detailValue}>{selected.vehicle}</div>
            </div>
            <div className={styles.detailItem}>
              <div className={styles.detailLabel}>City</div>
              <div className={styles.detailValue}>{selected.city}</div>
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
            {quotesByRequestId[selected.id] ? (
              <div className={styles.detailItem} style={{ gridColumn: "1 / -1" }}>
                <div className={styles.detailLabel}>Latest quote</div>
                <div className={styles.detailValue}>
                  <div className={styles.quoteLine}>
                    <span className={styles.quoteKey}>Premium:</span> {quotesByRequestId[selected.id].premiumPkr} PKR
                  </div>
                  <div className={styles.quoteLine}>
                    <span className={styles.quoteKey}>Coverage:</span> {quotesByRequestId[selected.id].coverage}
                  </div>
                  <div className={styles.quoteLine}>
                    <span className={styles.quoteKey}>Duration:</span> {quotesByRequestId[selected.id].duration}
                  </div>
                  {quotesByRequestId[selected.id].notes ? (
                    <div className={styles.quoteLine}>
                      <span className={styles.quoteKey}>Notes:</span> {quotesByRequestId[selected.id].notes}
                    </div>
                  ) : null}
                </div>
              </div>
            ) : null}
          </div>
        ) : null}
      </Modal>
    </div>
  );
}

