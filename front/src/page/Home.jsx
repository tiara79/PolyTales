import { useCallback, useContext, useEffect, useMemo as useMem, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import "../style/Home.css";

const LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"];
const LEVEL_LABELS = { A1: "초급", A2: "초중급", B1: "중급", B2: "중고급", C1: "고급", C2: "최고급" };

const isAbs = (u) => /^https?:\/\//i.test(String(u || ""));
const norm = (p = "") => String(p).replace(/\\/g, "/").replace(/([^:]\/)\/+/g, "$1");

const baseName = (p = "") => {
  const s = norm(String(p));
  const i = s.lastIndexOf("/");
  if (i < 0) return s;
  return s.slice(i + 1);
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
  const rawNames = rawPaths.map(baseName).filter(Boolean);
  localFirst.push(...rawNames.map((n) => `/img/contents/${n}`));
  localFirst.push(...rawNames.map((n) => `/img/detail/${n}`));
  localFirst.push(...rawNames.flatMap((n) => wrapToLocal(n, s?.langlevel)));

  // 2) 원래 들어온 경로들 (절대/상대 섞임)
  later.push(...rawPaths);

  // 중복 제거 및 정규화
  const seen = new Set();
  const uniq = [];
  const all = [...localFirst, ...later];
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
  const candidates = useMem(() => {
    const result = buildSrcCandidates(story);
    // console.log("[FallbackImage] 후보:", result);
    return result;
  }, [story]);

  const [src, setSrc] = useState(candidates[0] || "/img/home/no_image.png");

  useEffect(() => {
    setSrc(candidates[0] || "/img/home/no_image.png");
  }, [candidates]);

  const handleImageError = useCallback(() => {
    const idx = candidates.indexOf(src);
    const next = candidates[idx + 1];
    setSrc(next || "/img/home/no_image.png");
  }, [candidates, src]);

  const handleImageLoad = useCallback(() => {}, []);

  return (
    <img
      className="image-card"
      src={src}
      alt={alt}
      onError={handleImageError}
      onLoad={handleImageLoad}
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

  const fetchAllStories = useCallback(async () => {
    const all = await api.get(`/stories`, { headers });
    return Array.isArray(all.data?.data) ? all.data.data : (Array.isArray(all.data) ? all.data : []);
  }, [headers]);

  const fetchStories = useCallback(
    async (level) => {
      setLoading(true);
      try {
        const L = String(level || "A1").toUpperCase();

        // 레벨별 호출
        const res = await api.get(`/stories/level/${L}`, { headers });
        let list = Array.isArray(res.data?.data) ? res.data.data : (Array.isArray(res.data) ? res.data : []);

        // 조건 맞지 않거나 빈 결과면 => 전체 리스트로 대체
        if (!Array.isArray(list) || list.length === 0) {
          list = await fetchAllStories();
        }
        setStories(list);
      } catch (error) {
        // 실패해도 전체 리스트로 대체
        try {
          const list = await fetchAllStories();
          setStories(list);
        } catch {
          setStories([]); // 최후 안전
        }
      } finally {
        setLoading(false);
      }
    },
    [headers, fetchAllStories]
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
          const locked = !s.can_access;
          return (
            <div key={`${s.storyid}-${s.langlevel}-${s.storytitle}`} className={`image-card-container ${locked ? "locked" : ""}`} onClick={() => onClickStory(s)}>
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
