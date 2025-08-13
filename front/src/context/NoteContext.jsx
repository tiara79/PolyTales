import { createContext, useState, useEffect } from "react";

export const NoteContext = createContext();

export const NoteProvider = ({ children, userid }) => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotes = async () => {
      setLoading(true);
      try {
        const response = await fetch(`http://localhost:3000/notes/${userid}`);
        const result = await response.json();
        if (result.message === "ok") {
          setNotes(result.data);
        } else {
          setNotes([]);
        }
      } catch (error) {
        setNotes([]);
      } finally {
        setLoading(false);
      }
    };
    if (userid) fetchNotes();
  }, [userid]);

  return (
    <NoteContext.Provider value={{ notes, loading }}>
      {children}
    </NoteContext.Provider>
  );
};
