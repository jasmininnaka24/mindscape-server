module.exports = (sequelize, DataTypes) => {
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
      default: 'Uncompleted',
    },
    room: {
      type: DataTypes.STRING,
      allowNull: false,
    }
  });

  return Tasks;
}

