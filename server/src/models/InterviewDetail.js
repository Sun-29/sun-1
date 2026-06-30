module.exports = (sequelize, DataTypes) => {
  const InterviewDetail = sequelize.define('InterviewDetail', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    interview_id: { type: DataTypes.INTEGER, allowNull: false, comment: '面试ID' },
    question_id: { type: DataTypes.INTEGER, allowNull: true, comment: '题目ID' },
    question_content: { type: DataTypes.TEXT, allowNull: false, comment: '题目内容' },
    question_type: { type: DataTypes.STRING(30), allowNull: true, comment: '题目类型' },
    user_answer: { type: DataTypes.TEXT, allowNull: true, comment: '用户答案' },
    answer_type: { type: DataTypes.ENUM('text','voice'), defaultValue: 'text', comment: '回答方式' },
    voice_url: { type: DataTypes.STRING(500), allowNull: true, comment: '语音URL' },
    voice_duration: { type: DataTypes.INTEGER, allowNull: true, comment: '语音时长(秒)' },
    ai_score: { type: DataTypes.DECIMAL(5,1), allowNull: true, comment: 'AI评分' },
    ai_comment: { type: DataTypes.TEXT, allowNull: true, comment: 'AI点评' },
    ai_follow_up: { type: DataTypes.TEXT, allowNull: true, comment: 'AI追问' },
    ai_follow_up_answer: { type: DataTypes.TEXT, allowNull: true, comment: '追问回答' },
    question_order: { type: DataTypes.INTEGER, allowNull: false, comment: '题目序号' },
    is_follow_up: { type: DataTypes.TINYINT, defaultValue: 0, comment: '是否追问' },
    parent_detail_id: { type: DataTypes.INTEGER, allowNull: true, comment: '父详情ID' }
  }, {
    tableName: 'interview_details'
  });
  return InterviewDetail;
};
