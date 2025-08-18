// Home.jsx
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import "../style/Home.css";

const LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"];
const LEVEL_LABELS = { A1: "초급", A2: "초중급", B1: "중급", B2: "중고급", C1: "고급", C2: "최고급" };

const FALLBACK_CARD = {
  storyid: 1,
  storytitle: "Lily's happy day",
  storycoverpath: "/style/img/contents/lilys_happy_day.png",
  langlevel: "A1",
  can_access: true
};

export default function Home() {
  const navigate = useNavigate();
  const { token } = useContext(AuthContext) || {};
  const [selected, setSelected] = useState("A1");
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(false);

  const headers = useMemo(() => (token ? { Authorization: `Bearer ${token}` } : undefined), [token]);

  const fetchStories = useCallback(
    async (level) => {
      setLoading(true);
      try {
        const L = String(level || "A1").toUpperCase();
        const res = await api.get(`/stories/level/${L}`, { headers });
        let list = Array.isArray(res.data?.data) ? res.data.data : (Array.isArray(res.data) ? res.data : []);

        if (!list || list.length === 0) {
          setStories([FALLBACK_CARD]);
        } else {
          setStories(list);
        }
      } catch {
        // 실패 시 fallback 카드만 표시
        setStories([FALLBACK_CARD]);
      } finally {
        setLoading(false);
      }
    },
    [headers]
  );

  useEffect(() => {
    fetchStories(selected);
  }, [selected, fetchStories]);

  const openDetailIds = [1, 10, 15, 17, 19, 29, 30, 38];

  const onClickStory = (s) => {
    // storyid 제한 없이 항상 이동
    navigate(`/detail?storyid=${s.storyid}&level=${selected}`);
  };

  return (
    <section className="recommend-section">
      <div className="level-buttons">
        {LEVELS.map((lv) => (
          <button
            key={lv}
            className={`level-button ${selected === lv ? "active" : ""}`}
            onClick={() => setSelected(lv)}
          >
            <span className="lv-en">{lv}</span>
            <br />
            <span className="lv-ko">{LEVEL_LABELS[lv]}</span>
          </button>
        ))}
      </div>

      {loading && <div className="loading">불러오는 중…</div>}
      {!loading && stories.length === 0 && <div className="empty">해당 레벨의 스토리가 없습니다.</div>}

      <div className="image-grid">
        {stories.map((s) => {
          // locked 처리 제거
          return (
            <div
              key={`${s.storyid}-${s.langlevel}-${s.storytitle}`}
              className="image-card-container"
              onClick={() => onClickStory(s)}
              style={{ cursor: "pointer" }}
            >
              <img
                className="image-card"
                src={s.storycoverpath || "/img/home/no_image.png"}
                alt={s.storytitle || "Story"}
              />
              <div className="image-title">{s.storytitle}</div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
