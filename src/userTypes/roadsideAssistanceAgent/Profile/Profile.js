import React, { useState } from "react";
import styles from "./Profile.module.css";
import "../../../components/UI/ui.css";

export default function Profile() {
  const [form, setForm] = useState({
    fullName: "Imran Roadside",
    phone: "+92 300 0000000",
    city: "Lahore",
    coverageArea: "Lahore + nearby",
    bio: "Fast roadside assistance with 24/7 availability.",
  });

  const onChange = (key) => (e) => setForm((p) => ({ ...p, [key]: e.target.value }));

  const onSave = (e) => {
    e.preventDefault();
    alert("Mock: profile saved");
  };

  return (
    <div className={styles.wrap}>
      <div className="panel">
        <div className="panelHeader">
          <div>
            <h2 className="panelTitle">Agent Profile</h2>
            <p className="panelSub">Create / update your roadside assistance profile (UI only)</p>
          </div>
        </div>
        <div className="panelInner">
          <form onSubmit={onSave} className={styles.form}>
            <div className="grid2">
              <div className={styles.field}>
                <label className={styles.label}>Full name</label>
                <input className="input" value={form.fullName} onChange={onChange("fullName")} />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Phone</label>
                <input className="input" value={form.phone} onChange={onChange("phone")} />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>City</label>
                <input className="input" value={form.city} onChange={onChange("city")} />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Coverage area</label>
                <input
                  className="input"
                  value={form.coverageArea}
                  onChange={onChange("coverageArea")}
                />
              </div>
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Bio</label>
              <textarea className="textarea" value={form.bio} onChange={onChange("bio")} />
            </div>

            <div className={styles.actions}>
              <button type="submit" className="btn btnPrimary">
                Save profile
              </button>
              <button type="button" className="btn" onClick={() => alert("Mock: preview")}>
                Preview
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

