module.exports = (sequelize, DataTypes) => {
  const Ranking = sequelize.define("Ranking", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    total_score: { type: DataTypes.DECIMAL(6,1), defaultValue: 0 },
    practice_count: { type: DataTypes.INTEGER, defaultValue: 0 },
    growth_value: { type: DataTypes.INTEGER, defaultValue: 0 },
    week_score: { type: DataTypes.DECIMAL(5,1), defaultValue: 0 },
    month_score: { type: DataTypes.DECIMAL(5,1), defaultValue: 0 },
    week_rank: { type: DataTypes.INTEGER, allowNull: true },
    month_rank: { type: DataTypes.INTEGER, allowNull: true },
    total_rank: { type: DataTypes.INTEGER, allowNull: true }
  }, { tableName: "rankings", timestamps: true, createdAt: false });
  return Ranking;
};
