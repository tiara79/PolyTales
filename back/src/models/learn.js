module.exports = (sequelize, DataTypes) => {
  const StoryLearn = sequelize.define('storylearn', {
    pageid: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    storyid: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    pagenumber: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    nation: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    imagepath: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    captionpath: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    audiopath: {
      type: DataTypes.TEXT,
      allowNull: false,
    }
  }, {
    tableName: 'storylearn',
    timestamps: false,
    freezeTableName: true
  });

  return StoryLearn;
};
