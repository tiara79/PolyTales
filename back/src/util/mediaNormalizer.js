// src/util/mediaNormalizer.js
const { toImgUrl, toAudioUrl } = require('../util/pathFixers');

function fixOne(obj) {
  if (!obj || typeof obj !== 'object') return obj;

  const out = { ...obj };

  // 이미지 후보 필드
  const IMG_KEYS = [
    'image', 'img', 'imagepath', 'imgpath', 'picture',
    'thumbnail', 'storycoverpath', 'cover', 'thumbnail_url'
  ];
  for (const k of IMG_KEYS) {
    if (out[k]) out[k] = toImgUrl(out[k]);
  }

  // 오디오 후보 필드
  const AUD_KEYS = ['audio', 'audiopath', 'sound', 'movie', 'mp3'];
  for (const k of AUD_KEYS) {
    if (out[k]) out[k] = toAudioUrl(out[k]);
  }

  // 중첩 배열 처리
  const NEST_KEYS = ['pages', 'items', 'results', 'list', 'data'];
  for (const nk of NEST_KEYS) {
    if (Array.isArray(out[nk])) out[nk] = out[nk].map(fixOne);
  }

  return out;
}

function normalizeMedia(data) {
  if (Array.isArray(data)) return data.map(fixOne);
  return fixOne(data);
}

module.exports = { normalizeMedia };
