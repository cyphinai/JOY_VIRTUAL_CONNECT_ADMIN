import React, { useMemo } from "react";
import styles from "./Pagination.module.css";

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

export default function Pagination({ page, pageSize, total, onChange }) {
  const totalPages = Math.max(1, Math.ceil((total || 0) / (pageSize || 1)));
  const safePage = clamp(page || 1, 1, totalPages);

  const range = useMemo(() => {
    const maxButtons = 7;
    const pages = [];
    const start = Math.max(1, safePage - 2);
    const end = Math.min(totalPages, start + maxButtons - 1);

    const startAdjusted = Math.max(1, end - maxButtons + 1);
    for (let p = startAdjusted; p <= end; p++) pages.push(p);

    return {
      pages,
      totalPages,
      canPrev: safePage > 1,
      canNext: safePage < totalPages,
    };
  }, [safePage, totalPages]);

  const go = (p) => onChange?.(clamp(p, 1, totalPages));

  return (
    <div className={styles.wrap}>
      <div className={styles.info}>
        Page <strong>{safePage}</strong> of <strong>{totalPages}</strong>
      </div>
      <div className={styles.controls}>
        <button className={styles.btn} type="button" disabled={!range.canPrev} onClick={() => go(safePage - 1)}>
          Prev
        </button>
        {range.pages.map((p) => (
          <button
            key={p}
            className={p === safePage ? styles.btnActive : styles.btn}
            type="button"
            onClick={() => go(p)}
          >
            {p}
          </button>
        ))}
        <button className={styles.btn} type="button" disabled={!range.canNext} onClick={() => go(safePage + 1)}>
          Next
        </button>
      </div>
    </div>
  );
}

