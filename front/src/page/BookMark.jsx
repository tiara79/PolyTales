// src/page/Bookmark.jsx
import { useContext, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { BookmarkContext } from "../context/BookmarkContext"; // 파일명 Bookmark.jsx와 일치
import { StoryContext } from "../context/StoryContext";
import "../style/Bookmark.css";
import "../style/History.css"; // 헤더(뒤로가기/제목) 스타일 재사용

const LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"];
const LEVEL_LABELS = { A1: "초급", A2: "초중급", B1: "중급", B2: "중고급", C1: "고급", C2: "최고급" };

// ---- 이미지 폴백 유틸 ----
const isAbs = (u) => /^https?:\/\//i.test(String(u || ""));
const norm = (p = "") => String(p).replace(/\\/g, "/").replace(/([^:]\/)\/+/g, "$1");
const baseName = (p = "") => {
  const s = norm(String(p));
  const i = s.lastIndexOf("/");
  return i >= 0 ? s.slice(i + 1) : s;
};
const slugifyTitle = (title = "") => {
  const s = String(title).toLowerCase().replace(/'/g, "").replace(/&/g, "and").replace(/[^a-z0-9]+/g, " ").trim();
  return Array.from(new Set([s.replace(/\s+/g, "_"), s.replace(/\s+/g, "-")]));
};
const wrapLocal = (name, level) => {
  const n = baseName(name);
  if (!n) return [];
  const lv = String(level || "").toLowerCase();
  const arr = [`/img/contents/${n}`, `/img/detail/${n}`];
  if (lv) arr.push(`/img/${lv}/${n}`);
  return arr;
};
const dedupe = (arr) => {
  const out = [];
  const seen = new Set();
  for (const u of (arr || []).filter(Boolean)) {
    const k = isAbs(u) ? u : norm(u);
    if (!seen.has(k)) {
      seen.add(k);
      out.push(k);
    }
  }
  return out;
};
const buildCandidates = (bm, story) => {
  const title = story?.storytitle || bm.storytitle;
  const level = story?.langlevel || bm.langlevel;
  const fromStory = [
    ...(Array.isArray(story?.cover_candidates) ? story.cover_candidates : []),
    story?.thumbnail_url,
    story?.storycoverpath,
    story?.thumbnail,
  ];
  const fromBookMark = [bm.thumb, ...(Array.isArray(bm.thumbCandidates) ? bm.thumbCandidates : [])];
  const fromTitle = slugifyTitle(title)
    .flatMap((slug) => ["jpg", "png", "webp"].flatMap((ext) => [`${slug}.${ext}`, `${slug}_1.${ext}`]))
    .flatMap((n) => wrapLocal(n, level));
  return dedupe([...fromBookMark, ...fromStory, ...fromTitle, "/img/home/no_image.png"]);
};

function FallbackImage({ candidates, alt }) {
  const [i, setI] = useState(0);
  const src = candidates[i] || "/img/home/no_image.png";
  return (
    <img
      className="story-image"
      src={src}
      alt={alt}
      onError={() => {
        if (i < candidates.length - 1) setI(i + 1);
      }}
    />
  );
}

// --- 상세 레벨 자동 탐색 후 이동 ---
async function resolveAndGo(navigate, storyid, hintLevel, state) {
  const tryLevel = async (lv) => {
    try {
      await api.get(`/stories/${lv}/detail/${storyid}`);
      return true;
    } catch {
      return false;
    }
  };

  const hint = hintLevel ? String(hintLevel).toUpperCase() : null;
  if (hint && (await tryLevel(hint))) {
    navigate(`/detail?storyid=${storyid}&level=${hint}`, { state });
    return;
  }
  for (const lv of LEVELS) {
    if (lv === hint) continue;
    // 탐색 성공하면 해당 레벨로 이동
    if (await tryLevel(lv)) {
      navigate(`/detail?storyid=${storyid}&level=${lv}`, { state });
      return;
    }
  }
  // 모든 레벨 실패 → 준비중 안내
  window.alert("준비 중인 콘텐츠입니다.");
}

export default function BookMark() { // 컴포넌트명 Bookmark와 파일명 일치
  const navigate = useNavigate();
  const { bookmarks } = useContext(BookmarkContext);
  const storyContext = useContext(StoryContext);
  const story = storyContext?.story;
  const byId = useMemo(() => {
    const arr = story || [];
    const m = new Map();
    arr.forEach((s) => m.set(String(s.storyid), s));
    return m;
  }, [story]);

  const [selected, setSelected] = useState("A1");

  const filtered = useMemo(() => {
    const list = Array.isArray(bookmarks) ? bookmarks : [];
    return selected ? list.filter((b) => (b.langlevel || "").toUpperCase() === selected) : list;
  }, [bookmarks, selected]);

  return (
    <div className="history-container">
      <div className="mynotes-container">
        <div className="back-button-wrapper">
          <button className="back-button" onClick={() => navigate(-1)}>🔙</button>
          <h1 className="page-title">내가 찜한 책들</h1>
        </div>

        <div className="level-buttons">
          {LEVELS.map((lv) => {
            const isSel = selected === lv;
            return (
              <button
                key={lv}
                onClick={() => setSelected(isSel ? null : lv)}
                className={`level-btn ${lv} ${isSel ? `selected ${lv}` : ""}`}
              >
                <strong>{lv}</strong>
                <br />
                <span>{LEVEL_LABELS[lv]}</span>
              </button>
            );
          })}
        </div>

        <div className="image-grid">
          {filtered.length === 0 ? (
            <div className="empty">해당 레벨의 북마크가 없습니다.</div>
          ) : (
            filtered.map((b, idx) => {
              const s = byId.get(String(b.storyid));
              const level = (s?.langlevel || b.langlevel || "A1").toUpperCase();
              const title = s?.storytitle || b.storytitle || `Story ${b.storyid}`;
              const candidates = buildCandidates(b, s);

              return (
                <div
                  key={b.storyid || idx}
                  className="image-box"
                  onClick={() =>
                    resolveAndGo(navigate, b.storyid, level, {
                      thumb: candidates[0],
                      thumbCandidates: candidates,
                    })
                  }
                >
                  <FallbackImage candidates={candidates} alt={title} />
                  <p className="image-title">{title}</p>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

