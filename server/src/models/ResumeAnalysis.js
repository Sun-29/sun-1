module.exports = (sequelize, DataTypes) => {
  const ResumeAnalysis = sequelize.define('ResumeAnalysis', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    file_url: { type: DataTypes.STRING(500), allowNull: false },
    file_name: { type: DataTypes.STRING(200), allowNull: true },
    file_type: { type: DataTypes.STRING(20), allowNull: true },
    analysis_result: { type: DataTypes.JSON, allowNull: true },
    overall_score: { type: DataTypes.DECIMAL(5,1), allowNull: true },
    content_score: { type: DataTypes.DECIMAL(5,1), allowNull: true },
    format_score: { type: DataTypes.DECIMAL(5,1), allowNull: true },
    match_score: { type: DataTypes.DECIMAL(5,1), allowNull: true },
    match_position: { type: DataTypes.STRING(100), allowNull: true },
    strengths: { type: DataTypes.TEXT, allowNull: true },
    weaknesses: { type: DataTypes.TEXT, allowNull: true },
    suggestions: { type: DataTypes.TEXT, allowNull: true },
    keywords: { type: DataTypes.STRING(500), allowNull: true }
  }, { tableName: 'resume_analyses' });
  return ResumeAnalysis;
};
