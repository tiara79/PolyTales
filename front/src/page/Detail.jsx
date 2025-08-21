import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import React, { useState, useContext, useMemo, useEffect } from "react";
import { BookmarkContext } from "../context/BookmarkContext";
import api from "../api/axios";
import "../style/Detail.css";

const isAbs = (u) => /^https?:\/\//i.test(String(u || ""));
const norm = (p = "") => String(p).replace(/\\/g, "/").replace(/([^:]\/)\/+/g, "$1");

// 디테일 콘텐츠가 제공되는 ID
const OPEN_DETAIL_IDS = [10, 15, 17, 19, 29, 30, 38];

const dedupe = (arr) => {
  const seen = new Set();
  const out = [];
  for (const v of arr) {
    const k = isAbs(v) ? v : norm(v);
    if (!seen.has(k) && k) {
      seen.add(k);
      out.push(k);
    }
  }
  return out;
};

function FallbackImage({ candidates, alt }) {
  const [idx, setIdx] = useState(0);
  const src = candidates[idx] || "/img/home/no_image.png";
  return (
    <img
      src={src}
      alt={alt}
      onError={() => {
        if (idx < candidates.length - 1) setIdx(idx + 1);
      }}
    />
  );
}

export default function Detail() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = useLocation();

  // 더미 데이터 
  const [story, setStory] = useState({
    storyid: 1,
    storytitle: "Lily's Happy Day",
    langlevel: "A1",
    langlevelko: "초급",
    topic: "동화",
    description: `릴리와 함께 아침을 맞이하고, 작지만 특별한 하루를 만나보세요!
작은 소녀의 행복한 하루를 따라가는 사랑스러운 이야기
— 이제 막 읽기를 시작하는 아이들에게 딱 맞는 동화입니다.
햇살 가득한 아침부터 포근한 잠자리까지, 릴리의 발자취는 하루 속으로 떠나보세요!`,
    thumbnail_url: "/img/detail/lilys_happy_day.jpg"
  });

  // Azure API 연동 시 사용할 코드 
  /*
  useEffect(() => {
    const storyid = searchParams.get("storyid") || 1;
    const level = String(searchParams.get("langlevel") || "A1").toUpperCase();
    (async () => {
      try {
        const res = await api.get(`/stories/${level}/detail/${storyid}`);
        setStory(res.data?.data || null);
      } catch {
        setStory(null);
      }
    })();
  }, [searchParams]);
  */

  const isOpenId = story ? OPEN_DETAIL_IDS.includes(Number(story.storyid)) : false;

  const handleReadClick = () => {
    if (isOpenId) {
      window.alert("이 콘텐츠는 준비 중입니다.");
      return;
    }
    navigate("/learn");
  };

  const { addBookmark, removeBookmark, bookmarks } = useContext(BookmarkContext);

  const candidates = useMemo(() => {
    const fromHome = (() => {
      const st = location.state || {};
      const arr = [];
      if (st.thumb) arr.push(st.thumb);
      if (Array.isArray(st.thumbCandidates)) arr.push(...st.thumbCandidates);
      return arr;
    })();

    const fromApi = (() => {
      if (!story) return [];
      const arr = [];
      if (Array.isArray(story.cover_candidates)) arr.push(...story.cover_candidates);
      if (story.thumbnail_url) arr.push(story.thumbnail_url);
      return arr;
    })();

    const fallback = ["/img/home/no_image.png"];
    return dedupe([...fromHome, ...fromApi, ...fallback]);
  }, [location.state, story]);

  const isBookmarked =
    story && bookmarks?.some((b) => String(b.storyid) === String(story.storyid));

  const toggleBookmark = () => {
    if (!story) return;
    if (isBookmarked) {
      removeBookmark(story.storyid);
    } else {
      addBookmark({
        storyid: story.storyid,
        storytitle: story.storytitle,
        langlevel: story.langlevel,
        thumb: candidates[0] || "/img/home/no_image.png",
        thumbCandidates: candidates,
      });
    }
  };

  if (!story) {
    return (
      <div className="detail-container">
        <div>로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="detail-container">
      <div className="back-button-wrapper">
        <button className="back-button" onClick={() => navigate("/")}>🔙</button>
      </div>

      <div className="detail-wrapper">
        <div className="detail-image">
          <FallbackImage candidates={candidates} alt={story.storytitle} />
        </div>

        <div className="detail-text">
          <div className="detail-title-row">
            <h2 className="detail-title">
              {story.storytitle}
              <img
                src={isBookmarked ? "/img/detail/next_btn.png" : "/img/detail/pre_btn.png"}
                alt="bookmark"
                className="bookmark-icon"
                onClick={toggleBookmark}
              />
            </h2>
          </div>

          <div className="detail-tags">
            <span className={`tag tag-${story.langlevel?.toLowerCase()}`}>{story.langlevel}</span>
            <span className={`tag tag-${story.langlevel?.toLowerCase()}`}>{story.langlevelko}</span>
            <span className="tag tag-daily">{story.topic}</span>
          </div>

          <div className="detail-desc">
            <h4>작품 소개</h4>
            <p>
              {story.description &&
                story.description.split("\n").map((line, idx) => (
                  <React.Fragment key={idx}>
                    {line}
                    <br />
                  </React.Fragment>
                ))}
            </p>
          </div>

          <button className="read-button" onClick={handleReadClick} disabled={isOpenId}>
            읽기
          </button>
        </div>
      </div>
    </div>
  );
}
