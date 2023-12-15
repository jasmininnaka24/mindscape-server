module.exports = (sequelize, DataTypes) => {
  const DashForPersonalAndGroup = sequelize.define("DashForPersonalAndGroup", {
    dashFor: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    overAllItems: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0, 
    },
    preAssessmentScore: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0, 
    },
    assessmentScore: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: 'none',
    },
    assessmentImp: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: 'none',
    },
    assessmentScorePerf: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: 'none',
    },
    completionTime: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: 'none',
    },
    confidenceLevel: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: 'none',
    },
    numOfTakes: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1, 
    },    
    analysis: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: 'No record of analysis yet.', 
    },    
  });

  DashForPersonalAndGroup.associate = (models) => {
    DashForPersonalAndGroup.belongsTo(models.User, {
      foreignKey: {
        name: 'UserId',
        allowNull: true, // Allow null to remove the association
        onDelete: 'SET NULL', // or 'SET DEFAULT'
      },
    });
  }


  return DashForPersonalAndGroup;
}
