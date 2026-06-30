const { Sequelize, DataTypes } = require('sequelize');
const config = require('../config');

const sequelize = new Sequelize(config.db.database, config.db.username, config.db.password, {
  host: config.db.host,
  port: config.db.port,
  dialect: 'mysql',
  logging: config.nodeEnv === 'development' ? console.log : false,
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  define: {
    timestamps: true,
    underscored: true,
    freezeTableName: false
  },
  timezone: '+08:00'
});

const db = {};

// Import models
db.User = require('./User')(sequelize, DataTypes);
db.Admin = require('./Admin')(sequelize, DataTypes);
db.Position = require('./Position')(sequelize, DataTypes);
db.QuestionCategory = require('./QuestionCategory')(sequelize, DataTypes);
db.Question = require('./Question')(sequelize, DataTypes);
db.Interview = require('./Interview')(sequelize, DataTypes);
db.InterviewDetail = require('./InterviewDetail')(sequelize, DataTypes);
db.ScoreReport = require('./ScoreReport')(sequelize, DataTypes);
db.ResumeAnalysis = require('./ResumeAnalysis')(sequelize, DataTypes);
db.LearningPath = require('./LearningPath')(sequelize, DataTypes);
db.WrongQuestion = require('./WrongQuestion')(sequelize, DataTypes);
db.Message = require('./Message')(sequelize, DataTypes);
db.Ranking = require('./Ranking')(sequelize, DataTypes);
db.SystemLog = require('./SystemLog')(sequelize, DataTypes);
db.UserFavorite = require('./UserFavorite')(sequelize, DataTypes);
db.InterviewRecording = require('./InterviewRecording')(sequelize, DataTypes);
db.LearningRecord = require('./LearningRecord')(sequelize, DataTypes);
db.Feedback = require('./Feedback')(sequelize, DataTypes);

// ===== User Associations =====
db.User.hasMany(db.Interview, { foreignKey: 'user_id', as: 'interviews' });
db.User.hasMany(db.ScoreReport, { foreignKey: 'user_id', as: 'scoreReports' });
db.User.hasMany(db.ResumeAnalysis, { foreignKey: 'user_id', as: 'resumeAnalyses' });
db.User.hasMany(db.LearningPath, { foreignKey: 'user_id', as: 'learningPaths' });
db.User.hasMany(db.WrongQuestion, { foreignKey: 'user_id', as: 'wrongQuestions' });
db.User.hasMany(db.Message, { foreignKey: 'user_id', as: 'messages' });
db.User.hasOne(db.Ranking, { foreignKey: 'user_id', as: 'ranking' });
db.User.hasMany(db.UserFavorite, { foreignKey: 'user_id', as: 'favorites' });
db.User.hasMany(db.InterviewRecording, { foreignKey: 'user_id', as: 'recordings' });
db.User.hasMany(db.LearningRecord, { foreignKey: 'user_id', as: 'learningRecords' });
db.User.hasMany(db.Feedback, { foreignKey: 'user_id', as: 'feedbacks' });
db.User.hasMany(db.SystemLog, { foreignKey: 'user_id', as: 'systemLogs' });

// ===== Admin Associations =====
db.Admin.hasMany(db.SystemLog, { foreignKey: 'admin_id', as: 'systemLogs' });

// ===== Position Associations =====
db.Position.hasMany(db.Question, { foreignKey: 'position_id', as: 'questions' });
db.Position.hasMany(db.Interview, { foreignKey: 'position_id', as: 'interviews' });
db.Position.hasMany(db.LearningPath, { foreignKey: 'position_id', as: 'learningPaths' });

// ===== QuestionCategory Associations =====
db.QuestionCategory.belongsTo(db.QuestionCategory, { foreignKey: 'parent_id', as: 'parent' });
db.QuestionCategory.hasMany(db.QuestionCategory, { foreignKey: 'parent_id', as: 'children' });
db.QuestionCategory.hasMany(db.Question, { foreignKey: 'category_id', as: 'questions' });

// ===== Question Associations =====
db.Question.belongsTo(db.QuestionCategory, { foreignKey: 'category_id', as: 'category' });
db.Question.belongsTo(db.Position, { foreignKey: 'position_id', as: 'position' });
db.Question.hasMany(db.InterviewDetail, { foreignKey: 'question_id', as: 'interviewDetails' });
db.Question.hasMany(db.WrongQuestion, { foreignKey: 'question_id', as: 'wrongQuestions' });
db.Question.hasMany(db.UserFavorite, { foreignKey: 'question_id', as: 'favorites' });

// ===== Interview Associations =====
db.Interview.belongsTo(db.User, { foreignKey: 'user_id', as: 'user' });
db.Interview.belongsTo(db.Position, { foreignKey: 'position_id', as: 'position' });
db.Interview.hasMany(db.InterviewDetail, { foreignKey: 'interview_id', as: 'details' });
db.Interview.hasOne(db.ScoreReport, { foreignKey: 'interview_id', as: 'scoreReport' });
db.Interview.hasMany(db.LearningPath, { foreignKey: 'interview_id', as: 'learningPaths' });

// ===== InterviewDetail Associations =====
db.InterviewDetail.belongsTo(db.Interview, { foreignKey: 'interview_id', as: 'interview' });
db.InterviewDetail.belongsTo(db.Question, { foreignKey: 'question_id', as: 'question' });
db.InterviewDetail.belongsTo(db.InterviewDetail, { foreignKey: 'parent_detail_id', as: 'parentDetail' });
db.InterviewDetail.hasMany(db.InterviewDetail, { foreignKey: 'parent_detail_id', as: 'childDetails' });
db.InterviewDetail.hasMany(db.InterviewRecording, { foreignKey: 'interview_detail_id', as: 'recordings' });
db.InterviewDetail.hasMany(db.WrongQuestion, { foreignKey: 'interview_detail_id', as: 'wrongQuestions' });

// ===== ScoreReport Associations =====
db.ScoreReport.belongsTo(db.Interview, { foreignKey: 'interview_id', as: 'interview' });
db.ScoreReport.belongsTo(db.User, { foreignKey: 'user_id', as: 'user' });

// ===== ResumeAnalysis Associations =====
db.ResumeAnalysis.belongsTo(db.User, { foreignKey: 'user_id', as: 'user' });

// ===== LearningPath Associations =====
db.LearningPath.belongsTo(db.User, { foreignKey: 'user_id', as: 'user' });
db.LearningPath.belongsTo(db.Position, { foreignKey: 'position_id', as: 'position' });
db.LearningPath.belongsTo(db.Interview, { foreignKey: 'interview_id', as: 'interview' });

// ===== WrongQuestion Associations =====
db.WrongQuestion.belongsTo(db.User, { foreignKey: 'user_id', as: 'user' });
db.WrongQuestion.belongsTo(db.Question, { foreignKey: 'question_id', as: 'question' });
db.WrongQuestion.belongsTo(db.InterviewDetail, { foreignKey: 'interview_detail_id', as: 'interviewDetail' });

// ===== Message Associations =====
db.Message.belongsTo(db.User, { foreignKey: 'user_id', as: 'user' });

// ===== Ranking Associations =====
db.Ranking.belongsTo(db.User, { foreignKey: 'user_id', as: 'user' });

// ===== SystemLog Associations =====
db.SystemLog.belongsTo(db.User, { foreignKey: 'user_id', as: 'user' });
db.SystemLog.belongsTo(db.Admin, { foreignKey: 'admin_id', as: 'admin' });

// ===== UserFavorite Associations =====
db.UserFavorite.belongsTo(db.User, { foreignKey: 'user_id', as: 'user' });
db.UserFavorite.belongsTo(db.Question, { foreignKey: 'question_id', as: 'question' });

// ===== InterviewRecording Associations =====
db.InterviewRecording.belongsTo(db.InterviewDetail, { foreignKey: 'interview_detail_id', as: 'interviewDetail' });
db.InterviewRecording.belongsTo(db.User, { foreignKey: 'user_id', as: 'user' });

// ===== LearningRecord Associations =====
db.LearningRecord.belongsTo(db.User, { foreignKey: 'user_id', as: 'user' });

// ===== Feedback Associations =====
db.Feedback.belongsTo(db.User, { foreignKey: 'user_id', as: 'user' });

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
