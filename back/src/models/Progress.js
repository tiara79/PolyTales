module.exports = (sequelize, DataTypes) => {
  const Progress = sequelize.define('Progress', {
    progressId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    userId: DataTypes.INTEGER,
    storyId: DataTypes.INTEGER,
    currentPage: DataTypes.INTEGER,
    isFinished: DataTypes.BOOLEAN,
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'Progress',
    timestamps: false
  });

  Progress.associate = (models) => {
    Progress.belongsTo(models.User, { foreignKey: 'userId' });
    Progress.belongsTo(models.Story, { foreignKey: 'storyId' });
  };

  return Progress;
};
