import React, { createContext, useState, useEffect } from 'react';
export const BookmarkContext = createContext();
export const BookmarkProvider = ({ children }) => {
  const [bookmarks, setBookmarks] = useState([]);
  useEffect(() => {
    const stored = localStorage.getItem('bookmarks');
    if (stored) setBookmarks(JSON.parse(stored));
  }, []);
  const addBookmark = (story) => {
    const updated = [...bookmarks, story];
    setBookmarks(updated);
    localStorage.setItem('bookmarks', JSON.stringify(updated));
  };
  const removeBookmark = (storyid) => {
    const updated = bookmarks.filter(b => b.storyid !== storyid);
    setBookmarks(updated);
    localStorage.setItem('bookmarks', JSON.stringify(updated));
  };
  return (
    <BookmarkContext.Provider value={{ bookmarks, addBookmark, removeBookmark }}>
      {children}
    </BookmarkContext.Provider>
  );
};