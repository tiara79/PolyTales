// src/util/coverResolver.js
// home, detail, learn, BookMark 등 스토리 테이블의 이미지 필드·경로가 제각각” 문제를 서버에서 표준화하도록 정리

const isAbs = (u) => /^https?:\/\//i.test(String(u || ""));
const norm = (p = "") => String(p).replace(/\\/g, "/").replace(/([^:]\/)\/+/g, "$1");

const baseName = (p = "") => {
  const s = norm(String(p || ""));
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

const asLocalImg = (p) => {
  if (!p) return null;
  const v = String(p);
  if (isAbs(v)) return null;
  if (v.startsWith("/img/")) return norm(v);
  if (v.startsWith("/style/img/")) return norm(v.replace(/^\/style\/img\//i, "/img/"));
  if (/^[\w.\-\/]+$/.test(v)) {
    const bn = baseName(v);
    if (v.includes("contents/")) return `/img/contents/${bn}`;
    return `/img/contents/${bn}`;
  }
  return null;
};

const fromStoryFields = (story) => {
  const raw = [story?.storycoverpath, story?.thumbnail, story?.thumbnail_url].filter(Boolean);
  const locals = [];
  const absolutes = [];
  for (const r of raw) {
    const loc = asLocalImg(r);
    if (loc) locals.push(loc);
    else if (isAbs(r)) absolutes.push(norm(r));
  }
  return { locals, absolutes };
};

const titleBased = (story) => {
  const out = [];
  const lv = String(story?.langlevel || "").toLowerCase();
  const add = (path) => out.push(norm(path));
  for (const slug of slugifyTitle(story?.storytitle)) {
    ["jpg", "png", "webp"].forEach((ext) => {
      add(`/img/contents/${slug}.${ext}`);
      if (lv) add(`/img/${lv}/${slug}.${ext}`);
      if (lv) add(`/img/${lv}/${slug}_1.${ext}`);
    });
  }
  return out;
};

function buildCoverCandidates(story = {}, page = "home") {
  const { locals, absolutes } = fromStoryFields(story);
  const lv = String(story?.langlevel || "").toLowerCase();
  const titleCands = titleBased(story);

  const list = [];
  if (page === "detail") {
    for (const slug of slugifyTitle(story?.storytitle)) {
      ["jpg", "png", "webp"].forEach((ext) => list.push(`/img/detail/${slug}.${ext}`));
    }
  }

  list.push(...locals);
  list.push(...titleCands);

  if (lv) {
    for (const r of [story?.storycoverpath, story?.thumbnail]) {
      const bn = baseName(r || "");
      if (bn) list.push(`/img/${lv}/${bn}`);
    }
  }

  list.push(...absolutes);
  list.push("/img/home/no_image.png");

  const uniq = [];
  const seen = new Set();
  for (const u of list) {
    const key = isAbs(u) ? u : norm(u);
    if (!seen.has(key)) {
      seen.add(key);
      uniq.push(key);
    }
  }
  return uniq;
}

function getCover(story = {}, page = "home") {
  // 1. 우선순위: storycoverpath → thumbnail → thumbnail_url
  const candidates = [
    story?.storycoverpath,
    story?.thumbnail,
    story?.thumbnail_url,
  ].filter(Boolean);

  // 2. 경로가 /img/로 시작하지 않으면 /img/contents/로 보정
  const normalized = candidates.map((p) => {
    if (!p) return null;
    if (/^https?:\/\//i.test(p)) return p;
    if (p.startsWith("/img/")) return p.replace(/\\/g, "/");
    return `/img/contents/${p.replace(/\\/g, "/").replace(/^\/?img\/contents\//, "")}`;
  }).filter(Boolean);

  // 3. 타이틀 기반 후보 추가 (간단화)
  if (story?.storytitle) {
    const slug = String(story.storytitle).toLowerCase().replace(/[^a-z0-9]+/g, "_");
    ["jpg", "png", "webp"].forEach((ext) => {
      normalized.push(`/img/contents/${slug}.${ext}`);
    });
  }

  // 4. 마지막 폴백
  normalized.push("/img/home/no_image.png");

  // 중복 제거
  const uniq = Array.from(new Set(normalized));

  return {
    thumbnail_url: uniq[0],
    cover_candidates: uniq,
  };
}

module.exports = { getCover };
