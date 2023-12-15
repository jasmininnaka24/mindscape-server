module.exports = (sequelize, DataTypes) => {
  const StudyGroup = sequelize.define("StudyGroup", {
    groupName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    code: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  });

  StudyGroup.associate = (models) => {
    StudyGroup.belongsTo(models.User, {
      foreignKey: {
        name: 'UserId',
        allowNull: true, // Allow null to remove the association
        onDelete: 'SET NULL', // or 'SET DEFAULT'
      },
    });
  

    StudyGroup.hasMany(models.StudyGroupMembers, {
      onDelete: 'cascade',
    })
    StudyGroup.hasMany(models.DashForPersonalAndGroup, {
      onDelete: 'cascade',
    })
    StudyGroup.hasMany(models.Tasks, {
      onDelete: 'cascade',
    })
  }

  return StudyGroup;
}