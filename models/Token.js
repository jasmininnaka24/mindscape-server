const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Token = sequelize.define("Token", {
    token: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      expires: 3600,
    },
  });

  // You can define associations or other configurations here if needed

  return Token;
};
