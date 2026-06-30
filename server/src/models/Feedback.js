module.exports = (sequelize, DataTypes) => {
  const Feedback = sequelize.define("Feedback", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    user_id: { type: DataTypes.INTEGER, allowNull: true },
    content: { type: DataTypes.TEXT, allowNull: false },
    images: { type: DataTypes.STRING(1000), allowNull: true },
    contact: { type: DataTypes.STRING(100), allowNull: true },
    status: { type: DataTypes.ENUM("pending","reviewed","resolved"), defaultValue: "pending" },
    admin_reply: { type: DataTypes.TEXT, allowNull: true }
  }, { tableName: "feedback" });
  return Feedback;
};
