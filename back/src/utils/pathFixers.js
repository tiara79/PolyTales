// back/src/utils/pathFixers.js
// BLOB_URL 예시 (둘 다 지원):
// 1) https://polytalesimg.blob.core.windows.net
// 2) https://polytalesimg.blob.core.windows.net/img
const BLOB_URL = (process.env.BLOB_URL || "").replace(/\/+$/, "");

const isAbs = (u) => /^https?:\/\//i.test(String(u || ""));

const joinUrl = (base, ...parts) => {
  const b = String(base || "").replace(/\/+$/, "");
  const p = parts
    .filter(Boolean)
    .map(String)
    .join("/")
    .replace(/\\/g, "/")
    .replace(/\/{2,}/g, "/")
    .replace(/^\/+/, "");
  return b ? `${b}/${p}` : `/${p}`;
};

const normalizeRel = (p) => {
  if (!p) return "";
  let s = String(p).trim();
  if (!s) return "";
  if (isAbs(s) || s.startsWith("/")) return s;

  s = s.replace(/\\/g, "/");
  s = s.replace(/^(\.\/)+/, "");
  // 선행 폴더 접두어 정리
  s = s.replace(/^style\/img\//i, "");
  s = s.replace(/^img\//i, "");
  s = s.replace(/^\/+/, "");
  s = s.replace(/\/{2,}/g, "/");
  return s;
};

function toImgUrl(input) {
  if (!input) return null;
  const raw = String(input).trim();
  if (!raw) return null;

  // 절대 URL
  if (isAbs(raw)) return raw;

  // "/..." 로 시작하는 경로
  if (raw.startsWith("/")) {
    if (!BLOB_URL) return raw;
    const path = raw.replace(/^\/+/, "");
    // "/img/..." 를 주고 BLOB_URL에도 /img가 있으면 중복 제거
    if (/^img\//i.test(path) && /\/img$/i.test(BLOB_URL)) {
      return joinUrl(BLOB_URL, path.replace(/^img\//i, ""));
    }
    return joinUrl(BLOB_URL, path);
  }

  // 상대경로/파일명
  const rel = normalizeRel(raw);

  if (BLOB_URL) {
    // BLOB_URL이 이미 /img로 끝나면 그대로 붙이고, 아니면 /img를 덧붙임
    if (/\/img$/i.test(BLOB_URL)) return joinUrl(BLOB_URL, rel);
    return joinUrl(BLOB_URL, "img", rel);
  }

  // 로컬 정적 폴더 폴백
  if (/^[\w.-]+\.(png|jpe?g|webp|gif|svg)$/i.test(rel)) {
    return `/style/img/contents/${rel}`;
  }
  return `/style/img/${rel}`;
}

function toAudioUrl(input) {
  if (!input) return null;
  const raw = String(input).trim();
  if (!raw) return null;

  if (isAbs(raw)) return raw;

  if (raw.startsWith("/")) {
    if (!BLOB_URL) return raw;
    const path = raw.replace(/^\/+/, "");
    if (/^audio\//i.test(path) && /\/audio$/i.test(BLOB_URL)) {
      return joinUrl(BLOB_URL, path.replace(/^audio\//i, ""));
    }
    return joinUrl(BLOB_URL, path);
  }

  const rel = normalizeRel(raw);

  if (BLOB_URL) {
    if (/\/audio$/i.test(BLOB_URL)) return joinUrl(BLOB_URL, rel);
    return joinUrl(BLOB_URL, "audio", rel);
  }

  return `/audio/${rel}`;
}

module.exports = { toImgUrl, toAudioUrl };
