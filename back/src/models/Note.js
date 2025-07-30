module.exports = (sequelize, DataTypes) => {
  const Note = sequelize.define('note', {
    noteid: { 
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    userid: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'userid'
      }
    },
    storyid: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'story',
        key: 'storyid'
      }
    },
    title: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    createdat: {  // createdAt -> createdat
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'note',
    timestamps: false,  // Sequelize 자동 timestamp 비활성화
    freezeTableName: true
  });

  return Note;
};