// src/context/BookmarkContext.jsx
import { createContext, useCallback, useEffect, useMemo, useState } from "react";

export const BookmarkContext = createContext({
  bookmarks: [],
  addBookmark: () => {},
  removeBookmark: () => {},
  isBookmarked: () => false,
});

export function BookmarkProvider({ children }) {
  const [bookmarks, setBookmarks] = useState([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("bookmarks");
      if (!raw) return;
      const parsed = JSON.parse(raw);
      setBookmarks(Array.isArray(parsed) ? parsed : []);
    } catch {
      setBookmarks([]);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("bookmarks", JSON.stringify(bookmarks));
    } catch {}
  }, [bookmarks]);

  useEffect(() => {
    const onStorage = (e) => {
      if (e.key !== "bookmarks") return;
      try {
        const next = e.newValue ? JSON.parse(e.newValue) : [];
        setBookmarks(Array.isArray(next) ? next : []);
      } catch {}
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const addBookmark = useCallback((story) => {
    setBookmarks((prev) => {
      const id = story?.storyid ?? story?.storyId ?? story?.id;
      if (id === undefined || id === null) return prev;
      const key = String(id);
      const exists = prev.some((b) => String(b.storyid) === key);
      return exists
        ? prev.map((b) => (String(b.storyid) === key ? { ...b, ...story } : b))
        : [...prev, story];
    });
  }, []);

  const removeBookmark = useCallback((storyid) => {
    const key = String(storyid);
    setBookmarks((prev) => prev.filter((b) => String(b.storyid) !== key));
  }, []);

  const isBookmarked = useCallback(
    (storyid) => bookmarks.some((b) => String(b.storyid) === String(storyid)),
    [bookmarks]
  );

  const value = useMemo(
    () => ({ bookmarks, addBookmark, removeBookmark, isBookmarked }),
    [bookmarks, addBookmark, removeBookmark, isBookmarked]
  );

  return <BookmarkContext.Provider value={value}>{children}</BookmarkContext.Provider>;
}
