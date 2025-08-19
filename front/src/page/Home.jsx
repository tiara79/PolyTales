// Home.jsx
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";
// import { StoryContext } from "../context/StoryContext";
import "../style/Home.css";

const LANGLEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"];
const LANGLEVEL_LABELS = { A1: "초급", A2: "초중급", B1: "중급", B2: "중고급", C1: "고급", C2: "최고급" };

const FALLBACK_CARD = {
  storyid: 1,
  storytitle: "Lily's happy day",
  storycoverpath: "/img/contents/lilys_happy_day.jpg", 
  langlevel: "A1",
  can_access: true
};

export default function Home() {
  const navigate = useNavigate();
  const { token } = useContext(AuthContext) || {};
  const [story, setstory] = useState([]); 
  const [selectedLangLevel, setSelectedLangLevel] = useState("A1");
  const [loading, setLoading] = useState(false);

  const headers = useMemo(() => (token ? { Authorization: `Bearer ${token}` } : undefined), [token]);

  const fetchstory = useCallback(
    async (langlevel) => {
      setLoading(true);
      try {
        const L = String(langlevel || "A1").toUpperCase();
        const res = await api.get(`/story/langlevel/${L}`, { headers }); // /stories → /story
        let list = Array.isArray(res.data?.data) ? res.data.data : (Array.isArray(res.data) ? res.data : []);
        if (!list || list.length === 0) {
          setstory([FALLBACK_CARD]);
        } else {
          setstory(list);
        }
      } catch {
        setstory([FALLBACK_CARD]);
      } finally {
        setLoading(false);
      }
    },
    [headers]
  );

  useEffect(() => {
    fetchstory(selectedLangLevel);
  }, [selectedLangLevel, fetchstory]);

  const onClickStory = (story) => {
    navigate(`/detail?storyid=${story.storyid}&langlevel=${selectedLangLevel}`);
  };

  return (
    <>
      <section className="recommend-section">
        <h2>언어레벨에 따라 언어를 공부해보세요!</h2>
        <div className="level-btn">
          {LANGLEVELS.map((lv) => (
            <button
              key={lv}
              className={`level-btn ${selectedLangLevel === lv ? "active" : ""}`}
              onClick={() => setSelectedLangLevel(lv)}
            >
              <span className="lv-en">{lv}</span>
              <br />
              <span className="lv-ko">{LANGLEVEL_LABELS[lv]}</span>
            </button>
          ))}
        </div>

        {loading && <div className="loading">불러오는 중…</div>}
        {!loading && story.length === 0 && <div className="empty">해당 레벨의 스토리가 없습니다.</div>}

        <div className="image-grid">
          {story.map((s) => (
            <div
              key={s.storyid}
              className="image-box"
              onClick={() => onClickStory(s)}
              style={{ cursor: "pointer" }}
            >
              <img
                className="story-image"
                src={s.storycoverpath || "/img/home/no_image.png"}
                alt={s.storytitle || "Story"}
                onError={(e) => {
                  e.currentTarget.src = "/img/home/no_image.png";
                }}
              />
              <div className="image-title">{s.storytitle}</div>
            </div>
          ))}
        </div>
      </section>
      <footer className="home-footer">
        <img
          src="/img/footer/admin.png"
          alt="Admin"
          className="footer-admin-img"
          style={{ cursor: "pointer" }}
          onClick={() => navigate('/admhome')}
          onError={(e) => { e.currentTarget.src = "/img/home/no_image.png"; }}
        />
      </footer>
    </>
  );
}
  );
}

