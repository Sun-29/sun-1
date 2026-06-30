module.exports = (sequelize, DataTypes) => {
  const UserFavorite = sequelize.define("UserFavorite", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    question_id: { type: DataTypes.INTEGER, allowNull: false }
  }, { tableName: "user_favorites", timestamps: true, updatedAt: false });
  return UserFavorite;
};
