// src/pages/Detail.jsx
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import React, { useState, useEffect, useContext, useMemo } from "react";
import { BookmarkContext } from "../context/BookmarkContext";
import api from "../api/axios";
import "../style/Detail.css";

const isAbs = (u) => /^https?:\/\//i.test(String(u || ""));
const norm = (p = "") => String(p).replace(/\\/g, "/").replace(/([^:]\/)\/+/g, "$1");

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

  const { addBookmark, removeBookmark, bookmarks } = useContext(BookmarkContext);

  useEffect(() => {
    const storyid = searchParams.get("storyid") || 1;
    const level = String(searchParams.get("level") || "A1").toUpperCase();
    (async () => {
      try {
        const res = await api.get(`/stories/${level}/detail/${storyid}`);
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

          <button className="read-button" onClick={() => navigate("/learn")}>읽기</button>
        </div>
      </div>
    </div>
  );
}
