module.exports = (sequelize, DataTypes) => {
  const InterviewRecording = sequelize.define("InterviewRecording", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    interview_detail_id: { type: DataTypes.INTEGER, allowNull: true },
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    file_url: { type: DataTypes.STRING(500), allowNull: false },
    file_name: { type: DataTypes.STRING(200), allowNull: true },
    duration: { type: DataTypes.INTEGER, allowNull: true },
    file_size: { type: DataTypes.INTEGER, allowNull: true },
    transcription: { type: DataTypes.TEXT, allowNull: true },
    status: { type: DataTypes.ENUM("pending","processing","completed","failed"), defaultValue: "pending" }
  }, { tableName: "interview_recordings", timestamps: true, updatedAt: false });
  return InterviewRecording;
};
