// src/context/NoteContext.jsx
import {
  createContext,
  useContext,
  useState,
  useMemo,
  useCallback,
  useEffect,
} from "react";
import { AuthContext } from "./AuthContext";

/*
  NoteContext
  - 노트 목록/상태 전역 관리
  - 로그인 사용자별 로컬 캐시(localStorage) 키 분리
  - 서버 호출 실패 시 사용자별 캐시로 복구
  - 낙관적 업데이트 적용(추가/수정/삭제)
  - 탭 간 동기화(storage 이벤트)
*/

export const NoteContext = createContext({
  notes: [],
  loading: false,
  error: null,
  loadNotes: async () => {},
  addNote: async () => {},
  updateNote: async () => {},
  deleteNote: async () => {},
  getNote: () => undefined,
  clearNotes: () => {},
});

export function NoteProvider({ children }) {
  const { user, token } = useContext(AuthContext);

  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // API 엔드포인트
  const API = process.env.REACT_APP_API_URL;
  // 필요 시 라우트만 교체 (예: `${API}/learn/notes`)
  const NOTES_URL = `${API}/notes`;

  // 사용자 식별자 통일
  const userId = user?.userid ?? user?.userId ?? null;

  // 사용자별 로컬 캐시 키
  const cacheKey = useMemo(
    () => (userId ? `notes:${String(userId)}` : null),
    [userId]
  );

  // 공통 헤더
  const authHeaders = useMemo(
    () => ({
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    }),
    [token]
  );

  const safeParse = (raw) => {
    try {
      const v = JSON.parse(raw);
      return Array.isArray(v) ? v : [];
    } catch {
      return [];
    }
  };

  const readCache = useCallback(() => {
    if (!cacheKey) return [];
    try {
      const raw = localStorage.getItem(cacheKey);
      return safeParse(raw);
    } catch {
      return [];
    }
  }, [cacheKey]);

  const writeCache = useCallback(
    (data) => {
      if (!cacheKey) return;
      try {
        localStorage.setItem(cacheKey, JSON.stringify(data ?? []));
      } catch {}
    },
    [cacheKey]
  );

  // 목록 로드
  const loadNotes = useCallback(
    async (params = {}) => {
      if (!userId) {
        setNotes([]);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const q = new URLSearchParams({
          userid: String(userId),
          ...Object.fromEntries(Object.entries(params).filter(([, v]) => v != null)),
        }).toString();

        const res = await fetch(`${NOTES_URL}?${q}`, { headers: authHeaders });
        if (!res.ok) throw new Error(`LOAD_FAILED_${res.status}`);
        const data = await res.json();
        const rows = Array.isArray(data) ? data : data?.rows ?? [];
        setNotes(rows);
        writeCache(rows);
      } catch (e) {
        setError(e);
        // 네트워크 실패 시 사용자별 로컬 캐시 복구
        setNotes(readCache());
      } finally {
        setLoading(false);
      }
    },
    [NOTES_URL, authHeaders, userId, readCache, writeCache]
  );

  // 사용자 전환 시 자동 로드
  useEffect(() => {
    if (userId) loadNotes();
    else setNotes([]);
  }, [userId, loadNotes]);

  // notes 변경 시 캐시 반영
  useEffect(() => {
    if (!userId) return;
    writeCache(notes);
  }, [notes, writeCache, userId]);

  // 다른 탭에서 동일 사용자 캐시 변경 시 동기화
  useEffect(() => {
    const onStorage = (e) => {
      if (!cacheKey || e.key !== cacheKey) return;
      setNotes(e.newValue ? safeParse(e.newValue) : []);
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [cacheKey]);

  const addNote = useCallback(
    async ({ title, content, storyid, page, extra = {} }) => {
      if (!userId) throw new Error("UNAUTHORIZED");
      const body = {
        title,
        content,
        storyid,
        page,
        userid: userId,
        ...extra,
      };

      const tempId = `tmp_${Date.now()}`;
      const optimistic = {
        noteid: tempId,
        ...body,
        createdat: new Date().toISOString(),
      };
      setNotes((prev) => [optimistic, ...prev]);

      try {
        const res = await fetch(NOTES_URL, {
          method: "POST",
          headers: authHeaders,
          body: JSON.stringify(body),
        });
        if (!res.ok) throw new Error(`CREATE_FAILED_${res.status}`);
        const saved = await res.json();
        setNotes((prev) =>
          prev.map((n) => (n.noteid === tempId ? saved : n))
        );
        return saved;
      } catch (e) {
        setNotes((prev) => prev.filter((n) => n.noteid !== tempId));
        setError(e);
        throw e;
      }
    },
    [NOTES_URL, authHeaders, userId]
  );

  const updateNote = useCallback(
    async (noteid, patch) => {
      const original = notes.find((n) => n.noteid === noteid);
      if (!original) return;

      setNotes((prev) =>
        prev.map((n) => (n.noteid === noteid ? { ...n, ...patch } : n))
      );

      try {
        const res = await fetch(`${NOTES_URL}/${noteid}`, {
          method: "PUT", // 서버가 부분 수정을 기대하면 PATCH로 교체
          headers: authHeaders,
          body: JSON.stringify(patch),
        });
        if (!res.ok) throw new Error(`UPDATE_FAILED_${res.status}`);
        const saved = await res.json();
        setNotes((prev) =>
          prev.map((n) => (n.noteid === noteid ? saved : n))
        );
        return saved;
      } catch (e) {
        setNotes((prev) =>
          prev.map((n) => (n.noteid === noteid ? original : n))
        );
        setError(e);
        throw e;
      }
    },
    [NOTES_URL, authHeaders, notes]
  );

  // 삭제 (낙관적 업데이트 + 롤백)
  const deleteNote = useCallback(
    async (noteid) => {
      const backup = notes.slice();
      setNotes((prev) => prev.filter((n) => n.noteid !== noteid));
      try {
        const res = await fetch(`${NOTES_URL}/${noteid}`, {
          method: "DELETE",
          headers: authHeaders,
        });
        if (!res.ok) throw new Error(`DELETE_FAILED_${res.status}`);
        return true;
      } catch (e) {
        setNotes(backup);
        setError(e);
        throw e;
      }
    },
    [NOTES_URL, authHeaders, notes]
  );

  const getNote = useCallback(
    (noteid) => notes.find((n) => n.noteid === noteid),
    [notes]
  );

  const clearNotes = useCallback(() => setNotes([]), []);

  const value = useMemo(
    () => ({
      notes,
      loading,
      error,
      loadNotes,
      addNote,
      updateNote,
      deleteNote,
      getNote,
      clearNotes,
    }),
    [notes, loading, error, loadNotes, addNote, updateNote, deleteNote, getNote, clearNotes]
  );

  return <NoteContext.Provider value={value}>{children}</NoteContext.Provider>;
}

export const useNotes = () => useContext(NoteContext);
