// back/src/models/Note.js
module.exports = (sequelize, DataTypes) => {
  const Note = sequelize.define('note',{
    noteid: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
  userid: {
    type: DataTypes.INTEGER,
    allowNull:false
  },
  storyid: {
    type:DataTypes.INTEGER,
    allowNull:false
  },
  title:{
    type: DataTypes.TEXT,
    allowNull: false
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  } 
  },{
    tableName:'note',
    timestamps: false,
    freezeTableName: true,
  });
  return Note;
};