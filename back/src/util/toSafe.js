// back/src/util/toSafe.js
module.exports = function toSafe(u) {
  const p = typeof u?.get === 'function' ? u.get({ plain: true }) : u || {};
  return {
    userid:        p.userid ?? null,
    username:      p.username ?? null,
    nickname:      p.nickname ?? null,
    email:         p.email ?? null,
    profimg:       p.profimg ?? null,
    oauthprovider: p.oauthprovider ?? null,
    oauthid:       p.oauthid ?? null,
    status:        p.status ?? 1,
    role:          p.role ?? 2,
    plan:          p.plan ?? 1,
  };
};
