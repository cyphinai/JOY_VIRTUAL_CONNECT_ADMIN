import { useEffect, useState } from "react";

export default function useLocalStorageState(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return typeof initialValue === "function" ? initialValue() : initialValue;
      return JSON.parse(raw);
    } catch {
      return typeof initialValue === "function" ? initialValue() : initialValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // ignore quota / private mode failures
    }
  }, [key, value]);

  return [value, setValue];
}

