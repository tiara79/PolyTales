module.exports = (sequelize, DataTypes) => {
  const Language = sequelize.define('Language', {
    vocaId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    word: DataTypes.TEXT,
    mean: DataTypes.TEXT,
    partSpeech: DataTypes.TEXT,
    vocaSentence: DataTypes.TEXT,
    nation: DataTypes.ENUM('ko', 'ja', 'en', 'de', 'es', 'fr'),
    storyId: DataTypes.INTEGER
  }, {
    tableName: 'Language',
    timestamps: false
  });

  Language.associate = (models) => {
    Language.belongsTo(models.Story, { foreignKey: 'storyId' });
  };

  return Language;
};
