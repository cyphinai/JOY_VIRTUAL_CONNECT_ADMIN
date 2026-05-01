import React, { useCallback, useMemo, useState } from "react";
import styles from "./Services.module.css";
import "../../../components/UI/ui.css";
import Modal from "../../../components/Modal/Modal";
import useLocalStorageState from "../../../app/hooks/useLocalStorageState";
import { useAuth } from "../../../app/auth/AuthProvider";

const BY_USER_KEY = "jvc_roadside_services_by_user";

const TEMPLATE = [
  { id: "S-01", name: "Towing", price: 3500, active: true },
  { id: "S-02", name: "Battery jump", price: 1500, active: true },
  { id: "S-03", name: "Flat tire change", price: 1200, active: true },
  { id: "S-04", name: "Fuel delivery", price: 1800, active: false },
];

function nextServiceId(list) {
  const nums = list
    .map((s) => s.id)
    .filter((id) => String(id).match(/^S-\d+$/i))
    .map((id) => parseInt(String(id).replace(/^S-/i, ""), 10));
  const max = nums.length ? Math.max(...nums) : 0;
  return "S-" + String(max + 1).padStart(2, "0");
}

export default function Services() {
  const { auth } = useAuth();
  const userId = auth?.userId || "anon";
  const [byUser, setByUser] = useLocalStorageState(BY_USER_KEY, {});
  const [query, setQuery] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ name: "", price: "", active: true });
  const [formErrors, setFormErrors] = useState({});

  const services = useMemo(() => (Array.isArray(byUser[userId]) ? byUser[userId] : TEMPLATE), [byUser, userId]);

  const setServices = useCallback(
    (updater) => {
      setByUser((prev) => {
        const cur = Array.isArray(prev[userId]) ? prev[userId] : TEMPLATE;
        const nextList = typeof updater === "function" ? updater(cur) : updater;
        return { ...prev, [userId]: nextList };
      });
    },
    [setByUser, userId]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return services.filter((s) => !q || s.name.toLowerCase().includes(q) || s.id.toLowerCase().includes(q));
  }, [services, query]);

  const openCreate = () => {
    setEditingId(null);
    setForm({ name: "", price: "", active: true });
    setFormErrors({});
    setFormOpen(true);
  };

  const openEdit = (s) => {
    setEditingId(s.id);
    setForm({ name: s.name, price: String(s.price), active: s.active });
    setFormErrors({});
    setFormOpen(true);
  };

  const onFormChange = (key) => (e) => {
    const v = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm((p) => ({ ...p, [key]: v }));
    setFormErrors((p) => ({ ...p, [key]: undefined }));
  };

  const validateForm = () => {
    const e = {};
    if (!String(form.name || "").trim()) e.name = "Service name is required.";
    const n = Number(String(form.price).replace(/,/g, ""));
    if (!form.price && form.price !== 0) e.price = "Price is required.";
    else if (Number.isNaN(n) || n < 0) e.price = "Enter a valid price (PKR).";
    setFormErrors(e);
    return Object.keys(e).length === 0;
  };

  const saveService = (ev) => {
    ev.preventDefault();
    if (!validateForm()) return;
    const price = Number(String(form.price).replace(/,/g, ""));
    if (editingId) {
      setServices((prev) =>
        prev.map((s) => (s.id === editingId ? { ...s, name: String(form.name).trim(), price, active: form.active } : s))
      );
    } else {
      const id = nextServiceId(services);
      setServices((prev) => [{ id, name: String(form.name).trim(), price, active: form.active }, ...prev]);
    }
    setFormOpen(false);
  };

  const toggle = (id) => {
    setServices((prev) => prev.map((s) => (s.id === id ? { ...s, active: !s.active } : s)));
  };

  const remove = (id) => {
    if (!window.confirm("Remove this service?")) return;
    setServices((prev) => prev.filter((s) => s.id !== id));
  };

  return (
    <div className={styles.wrap}>
      <p className={styles.lead}>
        Services for <strong>{auth?.name || "your account"}</strong> (saved in this browser per agent).
      </p>
      <div className="panel">
        <div className="panelHeader">
          <div>
            <h2 className="panelTitle">Services Listing</h2>
            <p className="panelSub">Add or edit services using the form (no quick-add without details)</p>
          </div>
          <button className="btn btnPrimary" type="button" onClick={openCreate}>
            + Add service
          </button>
        </div>
        <div className="panelInner">
          <div className={styles.tools}>
            <input
              className="input"
              placeholder="Search services..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          <div className="tableWrap" style={{ marginTop: 12 }}>
            <table className="table">
              <thead>
                <tr>
                  <th style={{ width: 120 }}>Service ID</th>
                  <th>Name</th>
                  <th style={{ width: 160 }}>Price (PKR)</th>
                  <th style={{ width: 160 }}>Status</th>
                  <th style={{ width: 200 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s) => (
                  <tr key={s.id}>
                    <td>{s.id}</td>
                    <td>{s.name}</td>
                    <td>{s.price.toLocaleString()}</td>
                    <td>
                      <span className={s.active ? "badge badgeOk" : "badge badgeDanger"}>
                        {s.active ? "Active" : "Hidden"}
                      </span>
                    </td>
                    <td>
                      <div className={styles.actions}>
                        <button className="btn" type="button" onClick={() => openEdit(s)}>
                          Edit
                        </button>
                        <button className="btn" type="button" onClick={() => toggle(s.id)}>
                          Toggle
                        </button>
                        <button className="btn btnDanger" type="button" onClick={() => remove(s.id)}>
                          Remove
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ color: "var(--muted)" }}>
                      No services found.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Modal
        open={formOpen}
        title={editingId ? "Edit service" : "Add service"}
        description="Fill in the service name and price. You can hide a service from listing without deleting it."
        onClose={() => setFormOpen(false)}
        footer={
          <>
            <button type="button" className="btn" onClick={() => setFormOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btnPrimary" form="serviceForm">
              {editingId ? "Save changes" : "Add service"}
            </button>
          </>
        }
      >
        <form id="serviceForm" onSubmit={saveService} className={styles.serviceForm}>
          <div className={styles.formField}>
            <label className={styles.formLabel} htmlFor="sv-name">
              Service name
            </label>
            <input
              id="sv-name"
              className="input"
              value={form.name}
              onChange={onFormChange("name")}
              placeholder="e.g. Battery jump"
            />
            {formErrors.name ? <div className={styles.formError}>{formErrors.name}</div> : null}
          </div>
          <div className={styles.formField}>
            <label className={styles.formLabel} htmlFor="sv-price">
              Price (PKR)
            </label>
            <input
              id="sv-price"
              className="input"
              inputMode="numeric"
              value={form.price}
              onChange={onFormChange("price")}
              placeholder="e.g. 1500"
            />
            {formErrors.price ? <div className={styles.formError}>{formErrors.price}</div> : null}
          </div>
          <div className={styles.formRowCheck}>
            <input id="sv-active" type="checkbox" checked={form.active} onChange={onFormChange("active")} />
            <label htmlFor="sv-active" className={styles.formCheckLabel}>
              Show as active in listing
            </label>
          </div>
        </form>
      </Modal>
    </div>
  );
}
