module.exports = (sequelize, DataTypes) => {
  const Story = sequelize.define('Story', {
    storyId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    storyTitle: { type: DataTypes.TEXT, allowNull: false },
    storyCoverPath: DataTypes.TEXT,
    thumbnail: DataTypes.TEXT,
    movie: DataTypes.TEXT,
    description: DataTypes.TEXT,
    langLevel: {
      type: DataTypes.ENUM('A1', 'A2', 'B1', 'B2', 'C1', 'C2'),
      allowNull: false
    },
    langLevelKo: {
      type: DataTypes.ENUM('초급','초중급','중급','중고급','고급','최고급')
    },
    nation: {
      type: DataTypes.ENUM('fr', 'ja', 'es', 'en', 'de', 'ko'),
      allowNull: false
    },
    topic: { type: DataTypes.TEXT, allowNull: false }
  }, {
    tableName: 'Story',
    timestamps: false
  });

  Story.associate = (models) => {
    Story.hasMany(models.Language, { foreignKey: 'storyId' });
    Story.hasMany(models.Note, { foreignKey: 'storyId' });
    Story.hasMany(models.Progress, { foreignKey: 'storyId' });
    Story.hasMany(models.Tutor, { foreignKey: 'storyId' });
  };

  return Story;
};
