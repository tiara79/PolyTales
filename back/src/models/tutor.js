// src/models/tutor.js
module.exports = (sequelize, DataTypes) => {
  const Tutor = sequelize.define("tutor", {
    chatid: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userid: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    storyid: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    sender: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        isIn: [['user', 'tutor']],
      },
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    createdat: {
      type: DataTypes.DATE,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
    },
  }, {
    timestamps: false,  // createdAt 자동 생성 방지
    freezeTableName: true, // Sequelize는 모델 이름을 복수형(plural)**으로 바꿔서 테이블 인식
  });
  return Tutor;
};
