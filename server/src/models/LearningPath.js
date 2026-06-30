module.exports = (sequelize, DataTypes) => {
  const LearningPath = sequelize.define('LearningPath', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    position_id: { type: DataTypes.INTEGER, allowNull: true },
    interview_id: { type: DataTypes.INTEGER, allowNull: true },
    title: { type: DataTypes.STRING(200), allowNull: true },
    path_data: { type: DataTypes.JSON, allowNull: true },
    progress: { type: DataTypes.INTEGER, defaultValue: 0 },
    total_steps: { type: DataTypes.INTEGER, defaultValue: 0 },
    completed_steps: { type: DataTypes.INTEGER, defaultValue: 0 },
    status: { type: DataTypes.ENUM('active','completed','paused'), defaultValue: 'active' },
    started_at: { type: DataTypes.DATEONLY, allowNull: true },
    completed_at: { type: DataTypes.DATEONLY, allowNull: true }
  }, { tableName: 'learning_paths' });
  return LearningPath;
};
