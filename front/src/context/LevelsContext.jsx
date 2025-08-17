// src/context/LevelsContext.jsx
import { createContext, useEffect, useMemo, useState, useCallback } from "react";

/*
  LevelsContext
  - 언어 레벨 상태 관리(A1~C2)
  - 로컬스토리지 저장/복구
  - 탭 간 동기화(storage 이벤트)
  - setLevel은 유효 값만 반영(대소문자/공백 정규화)
*/

const LEVELS = Object.freeze(["A1", "A2", "B1", "B2", "C1", "C2"]);
const STORAGE_KEY = "pt_level";
const DEFAULT_LEVEL = LEVELS[0];

export const LevelsContext = createContext({
  levels: LEVELS,
  level: DEFAULT_LEVEL,
  setLevel: () => {},
});

export function LevelsProvider({ children }) {
  const normalize = (v) => String(v ?? "").trim().toUpperCase();

  const readInitial = () => {
    if (typeof window === "undefined") return DEFAULT_LEVEL;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const v = normalize(raw);
      return LEVELS.includes(v) ? v : DEFAULT_LEVEL;
    } catch {
      return DEFAULT_LEVEL;
    }
  };

  const [level, _setLevel] = useState(readInitial);

  const setLevel = useCallback(
    (next) => {
      const v = normalize(typeof next === "function" ? next(level) : next);
      if (!LEVELS.includes(v)) return;
      _setLevel(v);
    },
    [level]
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(STORAGE_KEY, level);
    } catch {}
  }, [level]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const onStorage = (e) => {
      if (e.key !== STORAGE_KEY) return;
      const v = normalize(e.newValue);
      if (LEVELS.includes(v)) _setLevel(v);
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const value = useMemo(() => ({ levels: LEVELS, level, setLevel }), [level, setLevel]);

  return <LevelsContext.Provider value={value}>{children}</LevelsContext.Provider>;
}
