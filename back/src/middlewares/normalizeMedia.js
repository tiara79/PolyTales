// back/src/middlewares/normalizeMedia.js
// 경로 정규화(간결·일관): 응답 객체/배열 어디에 있어도 image/audio 후보 키를 찾아 toImgUrl/toAudioUrl로 보정
// back/src/middlewares/normalizeMedia.js
// back/src/middlewares/normalizeMedia.js
// -----------------------------------------------------------------------------
// 전역 응답 보정 미들웨어
// - res.json 직전에 body 혹은 body.data 내부를 깊이 순회
// - image/audio 후보 키를 찾아 pathFixers 로 정규화
// - image/audio 별칭이 비어 있으면 첫 후보값을 채워 일관성 보장
// -----------------------------------------------------------------------------
const { toImgUrl, toAudioUrl } = require('../util/pathFixers');

const IMG_KEYS = ['image','img','imagepath','imgpath','picture','thumbnail','storycoverpath','cover','thumbnail_url'];
const AUD_KEYS = ['audio','audiopath','sound','movie','mp3'];

function normalizeNode(node){
  if (Array.isArray(node)) return node.map(normalizeNode);
  if (!node || typeof node !== 'object') return node;

  const out = {};
  let firstImg = null;
  let firstAud = null;

  for (const [k,v] of Object.entries(node)){
    if (typeof v === 'string'){
      if (IMG_KEYS.includes(k)){
        const fixed = toImgUrl(v, node);
        out[k] = fixed;
        if (!firstImg) firstImg = fixed;
        continue;
      }
      if (AUD_KEYS.includes(k)){
        const fixed = toAudioUrl(v, node);
        out[k] = fixed;
        if (!firstAud) firstAud = fixed;
        continue;
      }
      out[k] = v;
      continue;
    }
    out[k] = normalizeNode(v);
  }

  if (!out.image && firstImg) out.image = firstImg;
  if (!out.audio && firstAud) out.audio = firstAud;

  return out;
}

module.exports = function normalizeMedia(_req, res, next){
  const orig = res.json.bind(res);
  res.json = (body) => {
    try {
      if (body && typeof body === 'object'){
        if (Object.prototype.hasOwnProperty.call(body,'data')){
          body.data = normalizeNode(body.data);
        } else {
          body = normalizeNode(body);
        }
      }
    } catch {}
    return orig(body);
  };
  next();
};
