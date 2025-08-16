// 번들러 무관 안전 베이스 경로
const IMG_BASE =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_IMAGE_BASE_URL) ||
  (typeof process !== "undefined" && process.env?.REACT_APP_IMAGE_BASE_URL) ||
  "/img";

const isAbs = (u) => /^https?:\/\//i.test(String(u || ""));
const norm = (p = "") =>
  String(p)
    .replace(/\\/g, "/")
    .replace(/([^:]\/)\/+/g, "$1")
    .replace(/^\.?\/*/, "");

export function toImageUrl(input, fallback = "/img/home/no_image.png") {
  if (!input) return fallback;
  const s = String(input).trim();
  if (!s) return fallback;
  if (isAbs(s) || s.startsWith("/")) return s;
  return `${IMG_BASE}/${norm(s)}`;
}

export function getProfileImageUrl(filename, fallback = "/img/profile/default.png") {
  if (!filename) return fallback;
  if (isAbs(filename) || filename.startsWith("/")) return filename;
  return `${IMG_BASE}/profile/${norm(filename)}`;
}
