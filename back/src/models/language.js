module.exports = (sequelize, DataTypes) => {
  const Language = sequelize.define('Language', {
    vocaid: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    grammar: DataTypes.TEXT,
    voca: DataTypes.TEXT,
    nation: {
      type: DataTypes.ENUM('ko', 'ja', 'en', 'de', 'es', 'fr')
    },
    storyid: {
      type: DataTypes.INTEGER,
      references: {
        model: 'story',
        key: 'storyid'
      }
    }
  }, {
    tableName: 'language',
    timestamps: false,
    freezeTableName: true
  });

  return Language;
};
