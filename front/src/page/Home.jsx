import { useEffect, useMemo, useState, useContext, useCallback, useMemo as useMem } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import api from "../api/axios";
import "../style/Home.css";

const LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"];
const LEVEL_LABELS = { A1: "초급", A2: "초중급", B1: "중급", B2: "중고급", C1: "고급", C2: "최고급" };



// URL/경로 관련
// isAbs: 절대 URL인지 검사 (http, https).
// norm: 경로 정규화 (\ → /, 중복 슬래시 제거).
// baseName: 경로에서 파일명만 추출
const isAbs = (u) => /^https?:\/\//i.test(String(u || ""));
const norm = (p = "") => String(p).replace(/\\/g, "/").replace(/([^:]\/)\/+/g, "$1");

// 제목 → 파일명 변환
const baseName = (p = "") => {
  const s = norm(String(p));
  const i = s.lastIndexOf("/");
  return i >= 0 ? s.slice(i + 1) : s;
};

const slugifyTitle = (title = "") => {
  const s = String(title)
    .toLowerCase()
    .replace(/'/g, "")
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
  const under = s.replace(/\s+/g, "_");
  const hyphen = s.replace(/\s+/g, "-");
  return Array.from(new Set([under, hyphen]));
};

// /img/contents, /img/detail, /img/레벨명/파일명 순서.
const wrapToLocal = (name, langlevel) => {
  const n = baseName(name);
  if (!n) return [];
  const lv = String(langlevel || "").toLowerCase(); // a1, a2 ...
  const arr = [`/img/contents/${n}`, `/img/detail/${n}`];
  if (lv) arr.push(`/img/${lv}/${n}`);
  return arr;
};

const buildSrcCandidates = (s) => {
  const localFirst = [];
  const later = [];

  const rawPaths = [s?.storycoverpath_url, s?.storycoverpath, s?.storycover_path, s?.storycoverpath].filter(Boolean);

  // 1) 로컬 정적 경로 후보(파일명 기준) — 최우선
  const names = new Set(rawPaths.map(baseName).filter(Boolean));
  for (const t of slugifyTitle(s?.storytitle)) {
    names.add(`${t}.jpg`);
    names.add(`${t}.png`);
    names.add(`${t}.webp`);
  }
  for (const n of names) {
    localFirst.push(...wrapToLocal(n, s?.langlevel));
  }

  // 2) 서버가 준 경로들 중에서 루트(/)나 /img로 시작하는 것은 그 자체로 시도
  for (const p of rawPaths) {
    const v = String(p);
    if (v.startsWith("/img/") || v.startsWith("/style/img/") || v.startsWith("/audio/") || v.startsWith("/")) {
      localFirst.push(norm(v.replace(/^\/style\/img\//i, "/img/")));
    }
  }

  // 3) 절대 URL(Blob 등)은 마지막에 시도
  for (const p of rawPaths) {
    if (isAbs(p)) later.push(norm(p));
  }

  // 4) 최종 폴백
  const all = [...localFirst, ...later, "/img/home/no_image.png"];

  // 중복 제거(앞쪽 우선)
  const uniq = [];
  const seen = new Set();
  for (const u of all) {
    const key = isAbs(u) ? u : norm(u);
    if (!seen.has(key)) {
      seen.add(key);
      uniq.push(key);
    }
  }
  return uniq;
};


// 기능: 이미지 로딩 실패 시, 후보 배열에서 다음 이미지로 자동 전환.
// useMem 사용으로 스토리 변경 시 후보 배열만 새로 계산.
// onError: 이미지 로딩 실패 시 idx 증가 → 다음 후보 시도.

function FallbackImage({ story, alt }) {
  const candidates = useMem(() => buildSrcCandidates(story), [story]);
  const [idx, setIdx] = useState(0);
  const src = candidates[idx] || "/img/home/no_image.png";

  return (
    <img
      className="story-image"
      src={src}
      alt={alt}
      onError={() => {
        if (idx < candidates.length - 1) setIdx(idx + 1);
      }}
    />
  );
}


// selected: 현재 선택된 레벨.
// story: API에서 가져온 스토리 리스트.
// loading: 로딩 상태.
// headers: API 호출 시 Authorization 헤더.
export default function Home() {
  const navigate = useNavigate();
  const { token } = useContext(AuthContext) || {};
  const [selected, setSelected] = useState("A1");
  const [loading, setLoading] = useState(false);
  // const [story, setstory] = useState([]);

  // 더미 데이터
  const [story, setstory] = useState([

  {
    storyid: 1,
    storytitle: "Lily's Happy Day",
    langlevel: "A1",
    storycoverpath: "contents/lilys_happy_day.jpg",
    can_access: true
  },
  {
    storyid: 2,
    storytitle: "Watch Dog, Watch Out!",
    langlevel: "C1",
    storycoverpath: "contents/watch_dog_watch_out.jpg",
    can_access: true
  },
  {
    storyid: 3,
    storytitle: "Fantasy Destination",
    langlevel: "C1",
    storycoverpath: "contents/fantasy_destination.jpg",
    can_access: true
  },
  {
    storyid: 4,
    storytitle: "Girls Girls",
    langlevel: "C1",
    storycoverpath: "contents/girls_girls.jpg",
    can_access: true
  },
  {
    storyid: 5,
    storytitle: "The Holes and the Iguanas",
    langlevel: "C1",
    storycoverpath: "contents/the_holes_and_the_iguanas.jpg",
    can_access: false
  },
  {
    storyid: 6,
    storytitle: "Beauty and the Beast",
    langlevel: "C2",
    storycoverpath: "contents/beauty_and_the_beast.jpg",
    can_access: false
  },
  {
    storyid: 7,
    storytitle: "Easter",
    langlevel: "C2",
    storycoverpath: "contents/easter.jpg",
    can_access: false
  },
  {
    storyid: 8,
    storytitle: "Lovely Unicorn Mary",
    langlevel: "C2",
    storycoverpath: "contents/lovely_unicorn_mary.jpg",
    can_access: false
  },
  {
    storyid: 9,
    storytitle: "The Galaxy",
    langlevel: "C2",
    storycoverpath: "contents/the_galaxy.jpg",
    can_access: false
  },
  {
    storyid: 10,
    storytitle: "Another Me...",
    langlevel: "C2",
    storycoverpath: "contents/another_me.jpg",
    can_access: false
  }
]);

  const headers = useMemo(() => (token ? { Authorization: `Bearer ${token}` } : undefined), [token]);

  const fetchstory = useCallback(
    async (langlevel) => {
      setLoading(true);
      try {
        const L = String(langlevel || "A1").toUpperCase();
        const res = await api.get(`/story/level/${L}`, { headers });
        setstory(Array.isArray(res.data?.data) ? res.data.data : []);
      } catch {
        setstory([]);
      } finally {
        setLoading(false);
      }
    },
    [headers]
  );

  // 프론트 -> 로컬 전환
  // useEffect(() => {
  //   fetchstory(selected);
  // }, [selected, fetchstory]);

  const onClickStory = (s) => {
    if (s?.can_access) navigate(`/detail?storyid=${s.storyid}&langlevel=${selected}`);
  };

  return (
    <section className="recommend-section">
      <h2>언어레벨에 따라 언어를 공부해보세요!</h2>
      <div className="level-buttons">
        {LEVELS.map((lv) => (
          <button
            key={lv}
            className={`level-btn ${lv} ${selected === lv ? "selected" : ""}`}
            onClick={() => setSelected(lv)}
          >
            <span className="lv-en">{lv}</span>
            <br />
            <span className="lv-ko">{LEVEL_LABELS[lv]}</span>
          </button>
        ))}
      </div>

      {loading && <div className="loading">불러오는 중…</div>}
      {!loading && story.length === 0 && <div className="empty">해당 레벨의 스토리가 없습니다.</div>}

      <div className="image-grid">
        {story.map((s) => {
          const locked = !s.can_access;
          return (
            <div
              key={s.storyid}
              className={`image-box ${locked ? "locked-image" : ""}`}
              onClick={() => onClickStory(s)}
            >
              <FallbackImage story={s} alt={s.storytitle || "Story"} />
              {locked && (
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
  );
}
