const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const StudyGroupMembers = sequelize.define("StudyGroupMembers", {
    role: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  });

  return StudyGroupMembers;
};
