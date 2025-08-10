// src/middlewares/auth.js
const { verifyAccessToken } = require('../utils/token');
const { User } = require('../models');

// Authorization 헤더에서 Bearer 토큰 추출 (대소문자 안전)
function getBearerToken(req) {
  const h = req.headers.authorization || req.headers.Authorization || '';
  const [scheme, token] = String(h).split(' ');
  if (!scheme || !token) return null;
  return scheme.toLowerCase() === 'bearer' ? token : null;
}

// 토큰 검증 + 최신 사용자 상태 로드 + req.user 세팅
async function authRequired(req, res, next) {
  try {
    const token = getBearerToken(req);
    if (!token) return res.status(401).json({ message: 'No token' });

    // 사용자 정의 토큰 검증기 사용 (검증 실패 시 null/예외)
    const decoded = verifyAccessToken(token);
    if (!decoded) return res.status(401).json({ message: 'Invalid token' });

    // userid 키 호환: userid / userId / sub(표준) 지원
    const fromSub = decoded.sub != null ? Number(decoded.sub) : undefined;
    const rawId = decoded.userid ?? decoded.userId ?? fromSub;
    const userid = Number.isFinite(Number(rawId)) ? Number(rawId) : undefined;
    if (!userid) return res.status(401).json({ message: 'Invalid token payload' });

    // 한 번의 조회로 최신 상태/권한 포함하여 필요한 필드만 가져오기 (비밀번호 제외)
    const user = await User.findByPk(userid, {
      attributes: [
        'userid', 'username', 'email', 'nickname', 'profimg',
        'oauthprovider', 'oauthid', 'role', 'status'
      ]
    });
    if (!user) return res.status(401).json({ message: 'Invalid token' });

    // 비활성(강제삭제=3, 탈퇴=4) 즉시 차단
    if ([3, 4].includes(user.status)) {
      return res.status(403).json({ message: 'account disabled' });
    }

    // 표준 소문자 키로 세팅 (+ 레거시 호환 키 덧붙이기)
    req.user = {
      userid: user.userid,
      username: user.username,
      email: user.email,
      nickname: user.nickname,
      profimg: user.profimg,
      oauthprovider: user.oauthprovider,
      oauthid: user.oauthid,
      role: user.role,
      status: user.status,
    };
    // 레거시 호환
    req.user.userId  = req.user.userid;
    req.user.profImg = req.user.profimg;

    return next();
  } catch (e) {
    console.error('[authRequired] error:', e);
    return res.status(401).json({ message: 'Invalid/Expired token' });
  }
}

// 관리자만 접근 가능 (role === 1)
function onlyAdmin(req, res, next) {
  return req.user?.role === 1
    ? next()
    : res.status(403).json({ message: 'forbidden' });
}

module.exports = {
  authRequired,
  authenticate: authRequired, // 기존 코드 호환용 별칭
  onlyAdmin,
};
