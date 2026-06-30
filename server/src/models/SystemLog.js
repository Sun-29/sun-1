module.exports = (sequelize, DataTypes) => {
  const SystemLog = sequelize.define("SystemLog", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    user_id: { type: DataTypes.INTEGER, allowNull: true },
    admin_id: { type: DataTypes.INTEGER, allowNull: true },
    action: { type: DataTypes.STRING(100), allowNull: false },
    module: { type: DataTypes.STRING(50), allowNull: false },
    description: { type: DataTypes.STRING(500), allowNull: true },
    ip: { type: DataTypes.STRING(50), allowNull: true },
    user_agent: { type: DataTypes.STRING(500), allowNull: true },
    method: { type: DataTypes.STRING(10), allowNull: true },
    url: { type: DataTypes.STRING(500), allowNull: true },
    request_body: { type: DataTypes.TEXT, allowNull: true },
    response_status: { type: DataTypes.INTEGER, allowNull: true },
    duration_ms: { type: DataTypes.INTEGER, allowNull: true }
  }, { tableName: "system_logs", timestamps: true, updatedAt: false });
  return SystemLog;
};
