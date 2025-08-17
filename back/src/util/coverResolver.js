
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
  const cover_candidates = buildCoverCandidates(story, page);
  const thumbnail_url = cover_candidates[0] || "/img/home/no_image.png";
  return { thumbnail_url, cover_candidates };
}

module.exports = { getCover, buildCoverCandidates };
