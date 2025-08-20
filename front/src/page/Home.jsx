// Home.jsx
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
// import api from "../api/axios"; // 불필요하므로 삭제
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

const OPEN_DETAIL_IDS = [1, 10, 15, 17, 19, 29, 30, 38];
const AZURE_BLOB_BASE_URL = "https://polytales.blob.core.windows.net/img/contents"; // 실제 Blob Storage 주소로 변경


// story 모든 이미지 / 하위 페이지 관리
export default function Home() {
  const navigate = useNavigate();
  const [story, setstory] = useState([]); 
  const [selectedLangLevel, setSelectedLangLevel] = useState("A1");
  const [loading, setLoading] = useState(false);

  // 전체 리스트 한번에 가져오기
  const fetchAllStories = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/data/story_all.json");
      const list = await res.json();
      setstory(Array.isArray(list) ? list : []);
    } catch {
      setstory([FALLBACK_CARD]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllStories();
  }, [fetchAllStories]);

  useEffect(() => {
    console.log("[Home.jsx] 전체 story 리스트 개수:", story.length, story);
  }, [story]);

  // 선택된 레벨에 따라 필터링
  const filteredStories = story.filter(
    (s) => (s.langlevel || "A1").toUpperCase() === selectedLangLevel
  );

  const onClickStory = (story) => {
    navigate(`/detail?storyid=${story.storyid}&langlevel=${selectedLangLevel}`);
  };

  return (
    <>
      {/* 헤더는 App.jsx에서 관리, Home에서는 section부터 시작 */}
      <section className="recommend-section">
        <h2>언어레벨에 따라 언어를 공부해보세요!</h2>
        {/* .level-btns로 가로 출력 */}
        <div className="level-btn">
          {LANGLEVELS.map((langlevel) => (
            <button
              key={langlevel}
              className={`level-btn ${langlevel} ${selectedLangLevel === langlevel ? "active" : ""}`}
              onClick={() => setSelectedLangLevel(langlevel)}
            >
              <span className="lv-en">{langlevel}</span>
              <br />
              <span className="lv-ko">{LANGLEVEL_LABELS[langlevel]}</span>
            </button>
          ))}
        </div>

        {loading && <div className="loading">불러오는 중…</div>}
        {!loading && filteredStories.length === 0 && <div className="empty">해당 레벨의 스토리가 없습니다.</div>}
        <div className="image-grid">
          {filteredStories.map((s) => {
            const isOpen = OPEN_DETAIL_IDS.includes(Number(s.storyid));
            // Blob Storage 이미지 경로 생성
            const imageUrl = s.storycoverpath
              ? `${AZURE_BLOB_BASE_URL}/${s.storycoverpath.replace(/^\/?img\/contents\//, "")}`
              : "/img/home/no_image.png";
            return (
              <div
                key={s.storyid}
                className={`image-box${isOpen ? "" : " locked-image"}`}
                style={{ position: "relative", textAlign: "center", cursor: isOpen ? "pointer" : "not-allowed" }}
                onClick={() => isOpen && onClickStory(s)}
              >
                <img
                  className="story-image"
                  src={imageUrl}
                  alt={s.storytitle || "Story"}
                  style={isOpen ? {} : { filter: "blur(2px)", pointerEvents: "none" }}
                  onError={(e) => {
                    e.currentTarget.src = "/img/home/no_image.png";
                  }}
                />
                {!isOpen && (
                  <>
                    <div className="lock-icon">🔒</div>
                    <div className="lock-tooltip">Premium Service</div>
                  </>
                )}
                <div className="image-title">{s.storytitle}</div>
              </div>
            );
          })}
        </div>
      </section>
      {/* 푸터는 항상 렌더링 */}
      <footer className="admin-icon-footer">
        <img
          src="/img/footer/admin.png"
          alt="Admin"
          className="admin-icon-img"
          style={{ cursor: "pointer" }}
          onClick={() => navigate('/admhome')}
          onError={(e) => { e.currentTarget.src = "/img/home/no_image.png"; }}
        />
      </footer>
    </>
  );
}

