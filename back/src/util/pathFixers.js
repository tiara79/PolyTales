// back/src/util/pathFixers.js
// BLOB_URL 예시 (둘 다 지원):
// 1) https://polytalesimg.blob.core.windows.net
// 2) https://polytalesimg.blob.core.windows.net/img
// back/src/util/pathFixers.js
// -----------------------------------------------------------------------------
// 이미지/오디오 경로 보정기
// - 입력: 상대/혼합 경로, 출력: /img..., /audio... 형태의 정규화 경로
// - 옵션: { level: "A1"|"a1", story: "lily", lang: "ko"|... }
// -----------------------------------------------------------------------------
function s(x){ return String(x ?? '').trim(); }
function isHttp(u){ return /^https?:\/\//i.test(u); }
function fixSlashes(p){ return s(p).replace(/\\/g,'/'); }
function lead(p){ return p.startsWith('/') ? p : `/${p}`; }

// 이미지 URL
function toImgUrl(input, opts = {}) {
  let raw = fixSlashes(input);
  if (!raw) return '';
  if (isHttp(raw) || raw.startsWith('/img/')) return raw;

  // a1/lily/.. 형태면 /img 접두
  if (/^[a-z]\d\/.+/i.test(raw)) return lead(`img/${raw.replace(/^img\//,'')}`);

  const level = s(opts.level).toLowerCase();
  const story = s(opts.story);

  // story/파일 형태
  if (/^[a-z0-9_]+\/[^/]+\.(png|jpe?g|webp|gif)$/i.test(raw)) {
    return lead(`${level ? `img/${level}/` : 'img/'}${raw}`);
  }

  // 파일명만 온 경우
  if (/^[^/]+\.(png|jpe?g|webp|gif)$/i.test(raw) && level && story) {
    return lead(`img/${level}/${story}/${raw}`);
  }

  // 기타 케이스
  return lead(`img/${raw.replace(/^img\//,'')}`);
}

// 오디오 URL
function toAudioUrl(input, opts = {}) {
  let raw = fixSlashes(input);
  if (!raw) return '';
  if (isHttp(raw) || raw.startsWith('/audio/')) return raw;

  const level = s(opts.level).toLowerCase();
  const story = s(opts.story);
  const lang  = s(opts.lang).toLowerCase();

  let path = raw;

  if (/^[a-z]\d\/.+/i.test(path)) {
    // 그대로 사용
  } else if (/^[a-z0-9_]+\/.+/i.test(path)) {
    path = level ? `${level}/${path}` : path;
  } else if (level && story) {
    path = `${level}/${story}/${path}`;
  }

  const hasExt = /\.[a-z0-9]{2,4}$/i.test(path);
  const hasLangSuffix = /_[a-z]{2}(?=\.[a-z0-9]{2,4}$|$)/i.test(path);

  if (!hasExt) {
    if (lang && !hasLangSuffix) path = `${path}_${lang}.mp3`;
    else path = `${path}.mp3`;
  } else if (lang && !hasLangSuffix) {
    path = path.replace(/(\.[a-z0-9]{2,4})$/i, `_${lang}$1`);
  }

  return lead(`audio/${path.replace(/^audio\//,'')}`);
}

module.exports = { toImgUrl, toAudioUrl };
