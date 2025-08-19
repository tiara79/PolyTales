import { useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import "../style/History.css"; // 헤더 스타일 재사용
import "../style/Note.css";

export default function MyNotes() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [note, setNote] = useState([]); // notes → note
  const [loading, setLoading] = useState(true);

  // 목록 로딩
  useEffect(() => {
    if (!user?.userid) {
      setLoading(false);
      return;
    }
    (async () => {
      try {
        // GET /note/:userid
        const res = await api.get(`/note/${user.userid}`); 
        const list = Array.isArray(res.data?.data) ? res.data.data : [];
        // 날짜 내림차순
        list.sort((a, b) => new Date(b.createdat) - new Date(a.createdat));
        setNote(list);
      } catch (e) {
        setNote([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [user?.userid]);

  const byDay = useMemo(() => {
    const map = new Map();
    for (const n of note) {
      const day = new Date(n.createdat).toISOString().slice(0, 10); // YYYY-MM-DD
      if (!map.has(day)) map.set(day, []);
      map.get(day).push(n);
    }
    return Array.from(map.entries()).sort((a, b) => (a[0] < b[0] ? 1 : -1));
  }, [note]);

  if (!user) {
    navigate("/login");
    return null;
  }

  return (
    <div className="history-container">
      <div className="mynotes-container">
        <div className="back-button-wrapper">
          <button className="back-button" onClick={() => navigate(-1)}>🔙</button>
          <h1 className="page-title">마이 노트</h1>
        </div>

        {loading ? (
          <div className="notes-empty">로딩 중...</div>
        ) : note.length === 0 ? (
          <div className="notes-empty">저장된 노트가 없습니다.</div>
        ) : (
          byDay.map(([day, arr]) => (
            <div key={day} className="note-day-group">
              <h3 className="note-day-title">{day}</h3>
              <div className="note-list">
                {arr.map((note) => {
                  const dateStr = new Date(note.createdat).toLocaleString();
                  return (
                    <div key={note.noteid} className="note-card">
                      <div className="note-head">
                        <strong className="note-title-text">{note.title}</strong>
                        {note.istutor && <span className="note-badge">튜터</span>}
                        <span className="note-date-header">{dateStr}</span>
                      </div>
                      <div className="note-meta">
                        <span className="note-meta-item">{note.langlevel}</span>
                        <span className="note-meta-item">{note.lang}</span>
                        <span className="note-meta-item">Story #{note.storyid}</span>
                      </div>
                      <div className="note-content-preview">
                        {(note.content || "").slice(0, 200)}
                        {(note.content || "").length > 200 ? " ..." : ""}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
