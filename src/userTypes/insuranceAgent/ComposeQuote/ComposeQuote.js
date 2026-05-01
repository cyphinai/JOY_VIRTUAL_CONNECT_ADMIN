import React, { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import styles from "./ComposeQuote.module.css";
import "../../../components/UI/ui.css";
import useLocalStorageState from "../../../app/hooks/useLocalStorageState";
import {
  KEY_REQUESTS,
  KEY_QUOTES_BY_REQUEST,
  KEY_DRAFTS,
  KEY_SENT,
  INITIAL_QUOTES_BY_REQUEST,
  INITIAL_REQUESTS,
} from "../insuranceStorage";

function newDraftId() {
  return "D-" + Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2, 6);
}

function newSendId() {
  return "S-" + Date.now();
}

function formatNow() {
  return new Date().toLocaleString(undefined, { dateStyle: "short", timeStyle: "short" });
}

export default function ComposeQuote() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [requests, setRequests] = useLocalStorageState(KEY_REQUESTS, INITIAL_REQUESTS);
  const [quotesByRequestId, setQuotesByRequestId] = useLocalStorageState(
    KEY_QUOTES_BY_REQUEST,
    INITIAL_QUOTES_BY_REQUEST
  );
  const [drafts, setDrafts] = useLocalStorageState(KEY_DRAFTS, []);
  const [sentHistory, setSentHistory] = useLocalStorageState(KEY_SENT, []);

  const [requestId, setRequestId] = useState("");
  const [form, setForm] = useState({
    premiumPkr: "",
    coverage: "Comprehensive",
    duration: "12 months",
    notes: "",
  });
  const [errors, setErrors] = useState({});
  const [activeDraftId, setActiveDraftId] = useState(null);

  const req = useMemo(() => requests.find((r) => r.id === requestId), [requests, requestId]);

  useEffect(() => {
    setRequestId(searchParams.get("requestId") || "");
  }, [searchParams]);

  useEffect(() => {
    if (!requestId) return;
    const d = drafts.find((x) => x.requestId === requestId);
    if (d) {
      setForm({
        premiumPkr: d.premiumPkr || "",
        coverage: d.coverage || "Comprehensive",
        duration: d.duration || "12 months",
        notes: d.notes || "",
      });
      setActiveDraftId(d.draftId);
    } else {
      const last = quotesByRequestId[requestId];
      setForm({
        premiumPkr: last?.premiumPkr || "",
        coverage: last?.coverage || "Comprehensive",
        duration: last?.duration || "12 months",
        notes: last?.notes || "",
      });
      setActiveDraftId(null);
    }
  }, [requestId, drafts, quotesByRequestId]);

  const onChange = (key) => (e) => {
    const val = e.target.value;
    setForm((p) => ({ ...p, [key]: val }));
    setErrors((p) => ({ ...p, [key]: undefined }));
  };

  const saveDraft = () => {
    if (!requestId) {
      setErrors({ _global: "Select a quote request first." });
      return;
    }
    setErrors({});
    const now = formatNow();
    const id = activeDraftId || newDraftId();
    setDrafts((prev) => {
      const other = prev.filter((d) => d.requestId !== requestId);
      return [
        {
          draftId: id,
          requestId,
          clientName: req?.clientName || "",
          ...form,
          savedAt: now,
        },
        ...other,
      ];
    });
    setActiveDraftId(id);
  };

  const loadDraft = (d) => {
    setRequestId(d.requestId);
    setForm({
      premiumPkr: d.premiumPkr || "",
      coverage: d.coverage || "Comprehensive",
      duration: d.duration || "12 months",
      notes: d.notes || "",
    });
    setActiveDraftId(d.draftId);
    setSearchParams((prev) => ({ ...Object.fromEntries(prev.entries()), requestId: d.requestId }));
  };

  const removeDraft = (draftId) => {
    setDrafts((prev) => prev.filter((d) => d.draftId !== draftId));
    if (activeDraftId === draftId) setActiveDraftId(null);
  };

  const validate = () => {
    const next = {};
    if (!String(form.premiumPkr || "").trim()) next.premiumPkr = "Premium is required.";
    if (!String(form.coverage || "").trim()) next.coverage = "Coverage is required.";
    if (!String(form.duration || "").trim()) next.duration = "Duration is required.";
    if (!requestId) next._global = "Select a quote request first.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const sendQuote = (e) => {
    e.preventDefault();
    if (!validate() || !req) return;

    const payload = {
      premiumPkr: String(form.premiumPkr).trim(),
      coverage: String(form.coverage).trim(),
      duration: String(form.duration).trim(),
      notes: String(form.notes || "").trim(),
      createdAt: formatNow(),
    };

    setQuotesByRequestId((prev) => ({ ...prev, [requestId]: payload }));
    setRequests((prev) => prev.map((r) => (r.id === requestId ? { ...r, status: "quoted" } : r)));
    setSentHistory((prev) => [
      {
        id: newSendId(),
        requestId,
        clientName: req.clientName,
        vehicle: req.vehicle,
        city: req.city,
        ...payload,
        sentAt: formatNow(),
      },
      ...prev,
    ]);
    setDrafts((prev) => prev.filter((d) => d.requestId !== requestId));
    setActiveDraftId(null);
    setErrors({});
  };

  const recentSent = useMemo(() => sentHistory.slice(0, 8), [sentHistory]);

  return (
    <div className={styles.wrap}>
      <div className={styles.breadcrumb}>
        <Link className={styles.breadcrumbLink} to="/insurance/quotes">
          ← Quote requests
        </Link>
        <span className={styles.breadcrumbSep}>/</span>
        <span className={styles.breadcrumbCurrent}>Compose quote</span>
        <span className={styles.breadcrumbSpacer} />
        <Link className="btn" to="/insurance/quotes/sent">
          Full sent history
        </Link>
      </div>

      <div className={styles.layout}>
        <div className="panel">
          <div className="panelHeader">
            <div>
              <h2 className="panelTitle">Compose quote</h2>
              <p className="panelSub">Select a request, write the quote, save a draft, or send it (stored in browser)</p>
            </div>
          </div>
          <div className="panelInner">
            {errors._global ? <div className={styles.globalErr}>{errors._global}</div> : null}
            <div className={styles.field}>
              <label className={styles.label} htmlFor="rq">Quote request</label>
              <select
                id="rq"
                className="select"
                value={requestId}
                onChange={(e) => {
                  const v = e.target.value;
                  setRequestId(v);
                  setErrors({});
                  if (v) setSearchParams({ requestId: v }, { replace: true });
                  else setSearchParams({}, { replace: true });
                }}
              >
                <option value="">— Select request —</option>
                {requests
                  .filter((r) => r.status !== "quoted")
                  .map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.id} · {r.clientName} · {r.vehicle}
                    </option>
                  ))}
              </select>
            </div>
            {req ? (
              <div className={styles.summary}>
                <span className="badge">Request</span>
                <div className={styles.summaryText}>
                  {req.clientName} — {req.vehicle} — {req.city}
                </div>
              </div>
            ) : null}

            <form onSubmit={sendQuote} className={styles.form}>
              <div className="grid2">
                <div className={styles.field}>
                  <label className={styles.label}>Premium (PKR)</label>
                  <input
                    className="input"
                    value={form.premiumPkr}
                    onChange={onChange("premiumPkr")}
                    placeholder="e.g. 24000"
                  />
                  {errors.premiumPkr ? <div className={styles.error}>{errors.premiumPkr}</div> : null}
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Coverage</label>
                  <select className="select" value={form.coverage} onChange={onChange("coverage")}>
                    <option value="Comprehensive">Comprehensive</option>
                    <option value="Third Party">Third Party</option>
                    <option value="Collision Only">Collision Only</option>
                  </select>
                  {errors.coverage ? <div className={styles.error}>{errors.coverage}</div> : null}
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Duration</label>
                  <select className="select" value={form.duration} onChange={onChange("duration")}>
                    <option value="6 months">6 months</option>
                    <option value="12 months">12 months</option>
                    <option value="24 months">24 months</option>
                  </select>
                  {errors.duration ? <div className={styles.error}>{errors.duration}</div> : null}
                </div>
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Notes</label>
                <textarea className="textarea" value={form.notes} onChange={onChange("notes")} />
              </div>
              <div className={styles.actions}>
                <button type="button" className="btn" onClick={saveDraft} disabled={!requestId}>
                  Save draft
                </button>
                <button type="submit" className="btn btnPrimary" disabled={!requestId}>
                  Send quote
                </button>
              </div>
            </form>
          </div>
        </div>

        <aside className="panel">
          <div className="panelHeader">
            <div>
              <h2 className="panelTitle">Saved drafts</h2>
              <p className="panelSub">Resume work anytime (local only)</p>
            </div>
          </div>
          <div className="panelInner">
            {drafts.length === 0 ? (
              <p className={styles.muted}>No drafts yet. Pick a request and click Save draft.</p>
            ) : (
              <ul className={styles.draftList}>
                {drafts.map((d) => (
                  <li key={d.draftId} className={styles.draftItem}>
                    <div>
                      <div className={styles.draftId}>{d.requestId}</div>
                      <div className={styles.draftMeta}>
                        {d.premiumPkr || "—"} PKR · {d.savedAt}
                      </div>
                    </div>
                    <div className={styles.draftBtns}>
                      <button type="button" className="btn" onClick={() => loadDraft(d)}>
                        Open
                      </button>
                      <button type="button" className="btn btnDanger" onClick={() => removeDraft(d.draftId)}>
                        Remove
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>
      </div>

      <div className="panel">
        <div className="panelHeader">
          <div>
            <h2 className="panelTitle">Sent quotes (recent)</h2>
            <p className="panelSub">Latest items — see full list on the Sent page</p>
          </div>
        </div>
        <div className="panelInner">
          {recentSent.length === 0 ? (
            <p className={styles.muted}>No sent quotes yet. Use Send quote after composing.</p>
          ) : (
            <div className="tableWrap">
              <table className="table">
                <thead>
                  <tr>
                    <th style={{ width: 120 }}>Request</th>
                    <th>Client</th>
                    <th>Premium (PKR)</th>
                    <th>Coverage</th>
                    <th>Sent at</th>
                  </tr>
                </thead>
                <tbody>
                  {recentSent.map((s) => (
                    <tr key={s.id}>
                      <td>{s.requestId}</td>
                      <td>{s.clientName}</td>
                      <td>{s.premiumPkr}</td>
                      <td>{s.coverage}</td>
                      <td>{s.sentAt}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
