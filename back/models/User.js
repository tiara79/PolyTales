module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    userId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    oauthProvider: {
      type: DataTypes.ENUM('naver', 'kakao', 'google')
    },
    email: DataTypes.TEXT,
    nickName: DataTypes.TEXT,
    profile: DataTypes.TEXT,
    oauthId: {
      type: DataTypes.TEXT,
      unique: true
    }
  }, {
    tableName: 'User',
    timestamps: false
  });

  User.associate = (models) => {
    User.hasMany(models.Note, { foreignKey: 'userId' });
    User.hasMany(models.Progress, { foreignKey: 'userId' });
    User.hasMany(models.Tutor, { foreignKey: 'userId' });
  };

  return User;
};
