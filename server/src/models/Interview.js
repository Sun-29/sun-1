module.exports = (sequelize, DataTypes) => {
  const Interview = sequelize.define('Interview', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    user_id: { type: DataTypes.INTEGER, allowNull: false, comment: '用户ID' },
    position_id: { type: DataTypes.INTEGER, allowNull: false, comment: '岗位ID' },
    title: { type: DataTypes.STRING(200), allowNull: true, comment: '面试标题' },
    difficulty: { type: DataTypes.ENUM('junior','mid','senior'), defaultValue: 'junior', comment: '难度' },
    duration: { type: DataTypes.INTEGER, defaultValue: 30, comment: '计划时长(分钟)' },
    question_count: { type: DataTypes.INTEGER, defaultValue: 5, comment: '题目数量' },
    status: { type: DataTypes.ENUM('pending','ongoing','completed','cancelled'), defaultValue: 'pending', comment: '状态' },
    total_score: { type: DataTypes.DECIMAL(5,1), allowNull: true, comment: '总分' },
    current_question_index: { type: DataTypes.INTEGER, defaultValue: 0, comment: '当前题目索引' },
    ai_model: { type: DataTypes.STRING(50), defaultValue: 'deepseek', comment: 'AI模型' },
    started_at: { type: DataTypes.DATEONLY, allowNull: true, comment: '开始日期' },
    finished_at: { type: DataTypes.DATEONLY, allowNull: true, comment: '完成日期' }
  }, {
    tableName: 'interviews'
  });
  return Interview;
};
