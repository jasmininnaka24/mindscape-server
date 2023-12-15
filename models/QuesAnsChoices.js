module.exports = (sequelize, DataTypes) => {
  const QuesAnsChoices = sequelize.define("QuesAnsChoices", {
    choice: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  });


  return QuesAnsChoices;
}