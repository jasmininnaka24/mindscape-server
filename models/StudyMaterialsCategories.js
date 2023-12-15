// Assuming this is the file where your StudyMaterialsCategories model is defined

module.exports = (sequelize, DataTypes) => {
  const StudyMaterialsCategories = sequelize.define("StudyMaterialsCategories", {
    category: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    categoryFor: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    studyPerformance: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0.00,
    },
    isShared: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false,
    }
  });

  StudyMaterialsCategories.associate = (models) => {
    StudyMaterialsCategories.belongsTo(models.User, {
      foreignKey: {
        name: 'UserId',
        allowNull: true,
        onDelete: 'cascade',
      },
    });
    
    // Update the following line to reference the StudyGroup model
    StudyMaterialsCategories.belongsTo(models.StudyGroup, {
      foreignKey: {
        name: 'StudyGroupId',
        allowNull: true,
        onDelete: 'cascade',
      },
    });

    StudyMaterialsCategories.hasMany(models.StudyMaterials, {
      onDelete: 'cascade',
    });

    StudyMaterialsCategories.beforeDestroy(async (instance, options) => {
      if (instance.isShared === true) {
        options.cascade = false;
      }
    });
  };

  return StudyMaterialsCategories;
};
