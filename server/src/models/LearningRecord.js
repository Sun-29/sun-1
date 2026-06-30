module.exports = (sequelize, DataTypes) => {
  const LearningRecord = sequelize.define("LearningRecord", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    date: { type: DataTypes.DATEONLY, allowNull: false },
    practice_count: { type: DataTypes.INTEGER, defaultValue: 0 },
    total_duration: { type: DataTypes.INTEGER, defaultValue: 0 },
    avg_score: { type: DataTypes.DECIMAL(5,1), defaultValue: 0 },
    question_count: { type: DataTypes.INTEGER, defaultValue: 0 },
    interview_count: { type: DataTypes.INTEGER, defaultValue: 0 }
  }, { tableName: "learning_records", timestamps: true, updatedAt: false });
  return LearningRecord;
};
