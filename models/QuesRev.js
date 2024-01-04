const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
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
};
