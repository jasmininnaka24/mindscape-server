module.exports = (sequelize, DataTypes) => {
  const Followers = sequelize.define("Followers", {
    FollowerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    FollowingId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  });

  Followers.associate = (models) => {
    Followers.belongsTo(models.User, {
      foreignKey: 'FollowerId',
      onDelete: 'CASCADE',
      as: 'follower',
    });

    Followers.belongsTo(models.User, {
      foreignKey: 'FollowingId',
      onDelete: 'CASCADE',
      as: 'following',
    });
  };

  return Followers;
};
