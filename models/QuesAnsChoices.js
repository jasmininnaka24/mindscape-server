const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const QuesAnsChoices = sequelize.define("QuesAnsChoices", {
    choice: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  });

  return QuesAnsChoices;
};
