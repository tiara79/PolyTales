module.exports = (sequelize, DataTypes) => {
  const Story = sequelize.define('story', {
    storyid: {  // 실제 DB 컬럼명으로 정의
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    storytitle: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    storycoverpath: {
      type: DataTypes.TEXT
    },
    thumbnail: {
      type: DataTypes.TEXT
    },
    movie: {
      type: DataTypes.TEXT
    },
    description: {
      type: DataTypes.TEXT
    },
    langlevel: {
      type: DataTypes.ENUM('A1', 'A2', 'B1', 'B2', 'C1', 'C2'),
      allowNull: false
    },
    langlevelko: {
      type: DataTypes.ENUM('초급','초중급','중급','중고급','고급','최고급')
    },
    nation: {
      type: DataTypes.ENUM('fr', 'ja', 'es', 'en', 'de', 'ko'),
      allowNull: false
    },
    topic: {
      type: DataTypes.TEXT,
      allowNull: false
    }
  }, {
    tableName: 'story',
    timestamps: false,
    freezeTableName: true
  });

  return Story;
};