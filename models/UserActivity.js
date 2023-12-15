module.exports = (sequelize, DataTypes) => {
  const UserActivity = sequelize.define("UserActivity", {
    UserId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    actionType: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  });


  return UserActivity;
};
