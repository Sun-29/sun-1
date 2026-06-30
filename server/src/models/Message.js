module.exports = (sequelize, DataTypes) => {
  const Message = sequelize.define("Message", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    title: { type: DataTypes.STRING(200), allowNull: false },
    content: { type: DataTypes.TEXT, allowNull: true },
    type: { type: DataTypes.ENUM("system","interview","resume","task"), defaultValue: "system" },
    is_read: { type: DataTypes.TINYINT, defaultValue: 0 },
    related_id: { type: DataTypes.INTEGER, allowNull: true }
  }, { tableName: "messages", timestamps: true, updatedAt: false });
  return Message;
};
