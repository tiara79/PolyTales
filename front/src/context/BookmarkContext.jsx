// src/context/BookMarkContext.jsx
import { createContext, useCallback, useEffect, useMemo, useState } from "react";

export const BookMarkContext = createContext({
  BookMarks: [],
  addBookMark: () => {},
  removeBookMark: () => {},
  isBookMarked: () => false,
});

export function BookmarkProvider({ children }) {
  const [BookMarks, setBookMarks] = useState([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("BookMarks");
      if (!raw) return;
      const parsed = JSON.parse(raw);
      setBookMarks(Array.isArray(parsed) ? parsed : []);
    } catch {
      setBookMarks([]);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("BookMarks", JSON.stringify(BookMarks));
    } catch {}
  }, [BookMarks]);

  useEffect(() => {
    const onStorage = (e) => {
      if (e.key !== "BookMarks") return;
      try {
        const next = e.newValue ? JSON.parse(e.newValue) : [];
        setBookMarks(Array.isArray(next) ? next : []);
      } catch {}
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const addBookMark = useCallback((story) => {
    setBookMarks((prev) => {
      const id = story?.storyid ?? story?.storyId ?? story?.id;
      if (id === undefined || id === null) return prev;
      const key = String(id);
      const exists = prev.some((b) => String(b.storyid) === key);
      return exists
        ? prev.map((b) => (String(b.storyid) === key ? { ...b, ...story } : b))
        : [...prev, story];
    });
  }, []);

  const removeBookMark = useCallback((storyid) => {
    const key = String(storyid);
    setBookMarks((prev) => prev.filter((b) => String(b.storyid) !== key));
  }, []);

  const isBookMarked = useCallback(
    (storyid) => BookMarks.some((b) => String(b.storyid) === String(storyid)),
    [BookMarks]
  );

  const value = useMemo(
    () => ({ BookMarks, addBookMark, removeBookMark, isBookMarked }),
    [BookMarks, addBookMark, removeBookMark, isBookMarked]
  );

  return <BookMarkContext.Provider value={value}>{children}</BookMarkContext.Provider>;
}
