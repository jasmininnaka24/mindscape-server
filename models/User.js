const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const User = sequelize.define("User", {
    username: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    typeOfLearner: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'Unclassified', 
    },
    studyProfTarget: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 90, 
    },
    userImage: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: 'user.png', 
    },
    isVerified: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false, 
    },
  });

  User.associate = (models) => {
    User.hasMany(models.Tasks, {
      onDelete: 'cascade',
    });
    User.hasMany(models.Token, {
      onDelete: 'cascade',
    });
    User.hasMany(models.StudyGroupMembers, {
      onDelete: 'cascade',
    });
  };

  return User;
};
