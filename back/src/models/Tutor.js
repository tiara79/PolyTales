module.exports = (sequelize, DataTypes) => {
  const Tutor = sequelize.define('Tutor', {
    chatId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    userId: DataTypes.INTEGER,
    storyId: DataTypes.INTEGER,
    message: DataTypes.TEXT,
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'Tutor',
    timestamps: false
  });

  Tutor.associate = (models) => {
    Tutor.belongsTo(models.User, { foreignKey: 'userId' });
    Tutor.belongsTo(models.Story, { foreignKey: 'storyId' });
  };

  return Tutor;
};
