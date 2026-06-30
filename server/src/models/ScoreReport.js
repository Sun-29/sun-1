module.exports = (sequelize, DataTypes) => {
  const ScoreReport = sequelize.define('ScoreReport', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    interview_id: { type: DataTypes.INTEGER, allowNull: false, comment: '面试ID' },
    user_id: { type: DataTypes.INTEGER, allowNull: false, comment: '用户ID' },
    total_score: { type: DataTypes.DECIMAL(5,1), allowNull: false, comment: '总分' },
    professional_score: { type: DataTypes.DECIMAL(5,1), defaultValue: 0, comment: '专业知识分(40%)' },
    expression_score: { type: DataTypes.DECIMAL(5,1), defaultValue: 0, comment: '表达能力分(20%)' },
    logic_score: { type: DataTypes.DECIMAL(5,1), defaultValue: 0, comment: '逻辑思维分(20%)' },
    understanding_score: { type: DataTypes.DECIMAL(5,1), defaultValue: 0, comment: '问题理解分(20%)' },
    strengths: { type: DataTypes.TEXT, allowNull: true, comment: '优点' },
    weaknesses: { type: DataTypes.TEXT, allowNull: true, comment: '不足' },
    suggestions: { type: DataTypes.TEXT, allowNull: true, comment: '建议' },
    radar_data: { type: DataTypes.JSON, allowNull: true, comment: '雷达图数据' },
    detailed_feedback: { type: DataTypes.TEXT, allowNull: true, comment: '详细反馈' },
    position_rank: { type: DataTypes.INTEGER, allowNull: true, comment: '排名' }
  }, { tableName: 'score_reports' });
  return ScoreReport;
};
