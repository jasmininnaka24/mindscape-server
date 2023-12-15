module.exports = (sequelize, DataTypes) => {
  const StudyGroupMembers = sequelize.define("StudyGroupMembers", {
    role: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  });
  return StudyGroupMembers;
}