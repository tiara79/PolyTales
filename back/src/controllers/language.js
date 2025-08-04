module.exports = (sequelize, DataTypes) => {
  const Language = sequelize.define('Language', {
    vocaId: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    grammar: DataTypes.TEXT,
    word: DataTypes.TEXT,
    mean: DataTypes.TEXT,
    partSpeech: DataTypes.TEXT,
    vocaSentence: DataTypes.TEXT,
    nation: {
      type: DataTypes.ENUM('ko', 'a', 'en', 'de', 'es', 'fr')
    },
    storyId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'story',
        key: 'storyid'
      }
    }
  }, {
    tableName: 'language',
    timestamps: false
  });

  return Language;
};
