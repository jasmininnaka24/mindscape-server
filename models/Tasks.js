const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Tasks = sequelize.define("Tasks", {
    task: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    dueDate: {
      type: DataTypes.DATE,
      allowNull: false,
      validate: {
        isNotPastDate(value) {
          if (value !== null && new Date(value) < new Date()) {
            throw new Error('Due date must be in the present or future.');
          }
        },
      },
    },
    completedTask: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'Uncompleted', // Corrected default property
    },
    room: {
      type: DataTypes.STRING,
      allowNull: false,
    }
  });

  // You can define associations or other configurations here if needed

  return Tasks;
};
