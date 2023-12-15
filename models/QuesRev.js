module.exports = (sequelize, DataTypes) => {
  const QuesRev = sequelize.define("QuesRev", {
    question: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    answer: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  });


  return QuesRev;
}