// back/src/utils/pathFixers.js
// DataBase 경로 정리 유틸리티
const BLOB = process.env.BLOB_URL || "https://polytalesimg.blob.core.windows.net";

function cleanRel(p = "") {
  if (!p) return "";
  if (/^https?:\/\//i.test(p)) return p;             // 이미 절대 URL이면 그대로
  let s = String(p);

  // 1) 레거시 접두어 제거
  s = s.replace(/^\/?style\/img\//i, "");
  s = s.replace(/^\/?img\//i, "");
  s = s.replace(/^\/?audio\//i, "");

  // 2) 선행 슬래시 제거
  s = s.replace(/^\/+/, "");

  // 3) 레벨 대소문자 통일(A1 -> a1)
  s = s.replace(/^A1\//, "a1/")
       .replace(/^A2\//, "a2/")
       .replace(/^B1\//, "b1/")
       .replace(/^B2\//, "b2/")
       .replace(/^C1\//, "c1/")
       .replace(/^C2\//, "c2/");

  return s;
}

function toImgUrl(p)   { const rel = cleanRel(p); return rel ? `${BLOB}/img/${rel}`   : ""; }
function toAudioUrl(p) { const rel = cleanRel(p); return rel ? `${BLOB}/audio/${rel}` : ""; }

module.exports = { cleanRel, toImgUrl, toAudioUrl };
