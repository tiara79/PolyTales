// src/models/User.js
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('users', {
    userid:        { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, field: 'userid' },

    // 일반 로그인 필드
    username:      { type: DataTypes.STRING(50), allowNull: true, field: 'username' },
    password:      { type: DataTypes.TEXT, allowNull: true, field: 'password' },
    phone:         { type: DataTypes.STRING(20), allowNull: true, field: 'phone' },

    //  소셜/로컬 공통 식별자 (DB NOT NULL)
    oauthprovider: { type: DataTypes.TEXT, allowNull: false, field: 'oauthprovider',
                     validate: { isIn: [['naver','kakao','google','local']] } },
    oauthid:       { type: DataTypes.TEXT, allowNull: false, field: 'oauthid' },

    // 기타
    email:         { type: DataTypes.TEXT, allowNull: true, field: 'email' },
    nickname:      { type: DataTypes.TEXT, allowNull: true, field: 'nickname' },
    profimg:       { type: DataTypes.TEXT, allowNull: true, field: 'profimg' },

    status:        { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1, field: 'status' },
    role:          { type: DataTypes.INTEGER, allowNull: false, defaultValue: 2, field: 'role' },
    plan:          { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1, field: 'plan' },
    pay:           { type: DataTypes.INTEGER, allowNull: true, field: 'pay' },

    // 약관 캐시 최소안
    terms_version:   { type: DataTypes.INTEGER, allowNull: true, field: 'terms_version' },
    terms_agreed_at: { type: DataTypes.DATE,    allowNull: true, field: 'terms_agreed_at' },
  }, {
    tableName: 'users',
    timestamps: false,
    indexes: [
      { unique: true, fields: ['oauthprovider','oauthid'], name: 'users_oauthprovider_oauthid_unique' },
      { fields: ['nickname'], name: 'users_nickname_idx' }
    ]
  });

  return User;
};
