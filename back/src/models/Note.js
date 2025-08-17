// back/src/models/Note.js
module.exports = (sequelize, DataTypes) => {
  const Note = sequelize.define(
    "note",
    {
      noteid: {
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
      // 레벨/언어는 선택값 (DB 컬럼 소문자 유지)
      langlevel: {
        type: DataTypes.STRING(10),
        allowNull: true,
      },
      lang: {
        type: DataTypes.STRING(10),
        allowNull: true,
      },
      title: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      // 튜터 대화 포함 여부 
      istutor: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      createdat: {
        type: DataTypes.DATE,
        defaultValue: sequelize.literal("CURRENT_TIMESTAMP"),
      },
    },
    {
      tableName: "note",
      timestamps: false,
      freezeTableName: true,
    }
  );

  return Note;
};
