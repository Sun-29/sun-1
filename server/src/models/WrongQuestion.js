const bcrypt = require("bcryptjs");

module.exports = (sequelize, DataTypes) => {
  const WrongQuestion = sequelize.define("WrongQuestion", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    question_id: { type: DataTypes.INTEGER, allowNull: false },
    interview_detail_id: { type: DataTypes.INTEGER, allowNull: true },
    user_answer: { type: DataTypes.TEXT, allowNull: true },
    correct_answer: { type: DataTypes.TEXT, allowNull: true },
    ai_analysis: { type: DataTypes.TEXT, allowNull: true },
    review_count: { type: DataTypes.INTEGER, defaultValue: 0 },
    mastered: { type: DataTypes.TINYINT, defaultValue: 0 },
    next_review_date: { type: DataTypes.DATEONLY, allowNull: true }
  }, { tableName: "wrong_questions" });
  return WrongQuestion;
};
