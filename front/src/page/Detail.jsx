// src/page/Detail.jsx
import React, { useContext, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import api from "../api/axios";

import { BookMarkContext } from "../context/BookmarkContext";
import "../style/Detail.css";

const isAbs = (u) => /^https?:\/\//i.test(String(u || ""));
const norm = (p = "") => String(p).replace(/\\/g, "/").replace(/([^:]\/)\/+/g, "$1");

// 상세페이지 제공 리스트
const OPEN_DETAIL_IDS = [ 10, 15, 17, 19, 29, 30, 38];

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

  const [story, setStory] = useState(null);


  // 현재 스토리가 공개된 ID인지 확인 
    const isOpenId = story ? OPEN_DETAIL_IDS.includes(Number(story.storyid)) : false;

  // 상세페이지 제공 리스트에 해당 되지 않을 경우 예외 처리
    const handleReadClick = () => {
      if (isOpenId) {
        window.alert("이 콘텐츠는 준비 중입니다.");
        return;
      }
      navigate("/learn");
    };


  const { addBookMark, removeBookMark, BookMarks } = useContext(BookMarkContext);

  useEffect(() => {
    const storyid = searchParams.get("storyid") || 1;
    const level = String(searchParams.get("level") || "A1").toUpperCase();
    (async () => {
      try {
        const res = await api.get(`${process.env.REACT_APP_API_URL}/stories/${level}/detail/${storyid}`);
        setStory(res.data?.data || null);
      } catch {
        setStory(null);
      }
    })();
  }, [searchParams]);

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

  const isBookMarked =
    story && BookMarks?.some((b) => String(b.storyid) === String(story.storyid));

  const toggleBookMark = () => {
    if (!story) return;
    if (isBookMarked) {
      removeBookMark(story.storyid);
    } else {
      addBookMark({
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
                src={isBookMarked ? "/img/detail/next_btn.png" : "/img/detail/pre_btn.png"}
                alt="BookMark"
                className="BookMark-icon"
                onClick={toggleBookMark}
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

          <button className="read-button" onClick={handleReadClick} disabled={isOpenId}> 읽기 </button>
        </div>
      </div>
    </div>
  );
}
