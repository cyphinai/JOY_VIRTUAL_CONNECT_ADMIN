import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import styles from "./SentQuotesHistory.module.css";
import "../../../components/UI/ui.css";
import useLocalStorageState from "../../../app/hooks/useLocalStorageState";
import Pagination from "../../../components/Pagination/Pagination";
import { KEY_SENT } from "../insuranceStorage";

const PAGE = 7;

export default function SentQuotesHistory() {
  const [sentHistory] = useLocalStorageState(KEY_SENT, []);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return sentHistory;
    return sentHistory.filter(
      (s) =>
        s.requestId?.toLowerCase().includes(q) ||
        s.clientName?.toLowerCase().includes(q) ||
        s.vehicle?.toLowerCase().includes(q) ||
        s.city?.toLowerCase().includes(q) ||
        String(s.premiumPkr).toLowerCase().includes(q)
    );
  }, [sentHistory, query]);

  const total = filtered.length;
  const paged = useMemo(() => {
    const start = (page - 1) * PAGE;
    return filtered.slice(start, start + PAGE);
  }, [filtered, page]);

  return (
    <div className={styles.wrap}>
      <div className={styles.breadcrumb}>
        <Link className={styles.breadcrumbLink} to="/insurance/quotes/compose">
          ← Compose
        </Link>
        <span className={styles.breadcrumbSep}>/</span>
        <span className={styles.breadcrumbCurrent}>Sent quotes history</span>
      </div>

      <div className="panel">
        <div className="panelHeader">
          <div>
            <h2 className="panelTitle">Sent quotes</h2>
            <p className="panelSub">Every quote you sent is listed here (browser storage)</p>
          </div>
        </div>
        <div className="panelInner">
          <div className={styles.toolbar}>
            <input
              className="input"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
              placeholder="Search by request ID, client, amount..."
            />
            <Link className="btn btnPrimary" to="/insurance/quotes">
              Open requests
            </Link>
          </div>
          {filtered.length === 0 ? (
            <p className={styles.muted}>No sent quotes yet. Compose a quote and click Send.</p>
          ) : (
            <>
              <div className="tableWrap">
                <table className="table">
                  <thead>
                    <tr>
                      <th style={{ width: 100 }}>Ref</th>
                      <th style={{ width: 120 }}>Request</th>
                      <th>Client / Vehicle / City</th>
                      <th style={{ width: 120 }}>Premium</th>
                      <th style={{ width: 120 }}>Coverage</th>
                      <th>Notes</th>
                      <th style={{ width: 150 }}>Sent at</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paged.map((s) => (
                      <tr key={s.id}>
                        <td className={styles.mono}>{s.id}</td>
                        <td>{s.requestId}</td>
                        <td>
                          <div>{s.clientName}</div>
                          <div className={styles.subline}>
                            {s.vehicle} · {s.city}
                          </div>
                        </td>
                        <td>{s.premiumPkr}</td>
                        <td>{s.coverage}</td>
                        <td className={styles.notesCell}>{s.notes || "—"}</td>
                        <td>{s.sentAt}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Pagination page={page} pageSize={PAGE} total={total} onChange={setPage} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
