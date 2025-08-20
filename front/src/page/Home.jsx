// Home.jsx
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios"; // axios 사용
// import { StoryContext } from "../context/StoryContext";
import "../style/Home.css";

const LANGLEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"];
const LANGLEVEL_LABELS = { A1: "초급", A2: "초중급", B1: "중급", B2: "중고급", C1: "고급", C2: "최고급" };

// 여러 개의 FALLBACK_CARDS 배열로 변경
const FALLBACK_CARDS = [
  {
    storyid: 1,
    storytitle: "Lily's happy day",
    storycoverpath: "/img/contents/lilys_happy_day.jpg",
    langlevel: "A1",
    can_access: true
  },
  {
    storyid: 2,
    storytitle: "Adventure Story",
    storycoverpath: "/img/contents/adventure_story.jpg",
    langlevel: "B1",
    can_access: true
  },
  {
    storyid: 3,
    storytitle: "Magic Forest",
    storycoverpath: "/img/contents/magic_forest.jpg",
    langlevel: "C1",
    can_access: true
  }
];

const OPEN_DETAIL_IDS = [1, 10, 15, 17, 19, 29, 30, 38];
const AZURE_BLOB_BASE_URL = "https://polytales.blob.core.windows.net/img/contents"; // 실제 Blob Storage 주소로 변경


// story 모든 이미지 / 하위 페이지 관리
export default function Home() {
  const navigate = useNavigate();
  const [story, setstory] = useState([]); 
  const [selectedLangLevel, setSelectedLangLevel] = useState("A1");
  const [loading, setLoading] = useState(false);

  // 전체 리스트 한번에 가져오기 (axios + 백엔드 API 사용)
  const fetchAllStories = useCallback(async () => {
    setLoading(true);
    try {
      // 백엔드에서 전체 리스트 가져오기
      const res = await api.get("/story/all");
      const list = Array.isArray(res.data?.data) ? res.data.data : (Array.isArray(res.data) ? res.data : []);
      setstory(list.length ? list : FALLBACK_CARDS);
    } catch {
      setstory(FALLBACK_CARDS); // 에러 시 여러 개의 카드 보여주기
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

  // 버튼 래퍼 className을 .level-btns로 변경
  return (
    <>
      {/* 헤더는 App.jsx에서 관리, Home에서는 section부터 시작 */}
      <section className="recommend-section">
        <h2>언어레벨에 따라 언어를 공부해보세요!</h2>
        <div className="level-btns">
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

