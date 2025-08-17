import { useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import api from "../api/axios";
import "../style/Note.css";
import "../style/History.css"; // 헤더 스타일 재사용

export default function MyNotes() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  // 목록 로딩
  useEffect(() => {
    if (!user?.userid) {
      setLoading(false);
      return;
    }
    (async () => {
      try {
        // 백엔드 규약에 맞춰 주세요. (예: GET /notes/:userid)
        const res = await api.get(`/notes/${user.userid}`);
        const list = Array.isArray(res.data?.data) ? res.data.data : [];
        // 날짜 내림차순
        list.sort((a, b) => new Date(b.createdat) - new Date(a.createdat));
        setNotes(list);
      } catch (e) {
        setNotes([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [user?.userid]);

  const byDay = useMemo(() => {
    const map = new Map();
    for (const n of notes) {
      const day = new Date(n.createdat).toISOString().slice(0, 10); // YYYY-MM-DD
      if (!map.has(day)) map.set(day, []);
      map.get(day).push(n);
    }
    return Array.from(map.entries()).sort((a, b) => (a[0] < b[0] ? 1 : -1));
  }, [notes]);

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
        ) : notes.length === 0 ? (
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
