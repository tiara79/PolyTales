import { useEffect, useMemo, useState, useContext, useCallback, useMemo as useMem } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import api from "../api/axios";
import "../style/Home.css";

const LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"];
const LEVEL_LABELS = { A1: "초급", A2: "초중급", B1: "중급", B2: "중고급", C1: "고급", C2: "최고급" };

const isAbs = (u) => /^https?:\/\//i.test(String(u || ""));
const norm = (p = "") => String(p).replace(/\\/g, "/").replace(/([^:]\/)\/+/g, "$1");

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

const wrapToLocal = (name, level) => {
  const n = baseName(name);
  if (!n) return [];
  const lv = String(level || "").toLowerCase(); // a1, a2 ...
  const arr = [`/img/contents/${n}`, `/img/detail/${n}`];
  if (lv) arr.push(`/img/${lv}/${n}`);
  return arr;
};

const buildSrcCandidates = (s) => {
  const localFirst = [];
  const later = [];

  const rawPaths = [s?.thumbnail_url, s?.storycoverpath, s?.storycover_path, s?.thumbnail].filter(Boolean);

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
        setStories(Array.isArray(res.data?.data) ? res.data.data : []);
      } catch {
        setStories([]);
      } finally {
        setLoading(false);
      }
    },
    [headers]
  );

  useEffect(() => {
    fetchStories(selected);
  }, [selected, fetchStories]);

  const onClickStory = (s) => {
    if (s?.can_access) navigate(`/detail?storyid=${s.storyid}&level=${selected}`);
  };

  return (
    <section className="recommend-section">
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
      {!loading && stories.length === 0 && <div className="empty">해당 레벨의 스토리가 없습니다.</div>}

      <div className="image-grid">
        {stories.map((s) => {
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
                  <div className="lock-tooltip">로그인 후 이용 가능</div>
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
