module.exports = (sequelize, DataTypes) => {
  const QuestionCategory = sequelize.define('QuestionCategory', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: '分类名称'
    },
    parent_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: '父分类ID'
    },
    description: {
      type: DataTypes.STRING(500),
      allowNull: true,
      comment: '描述'
    },
    icon: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: '图标'
    },
    sort_order: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: '排序'
    },
    status: {
      type: DataTypes.TINYINT,
      defaultValue: 1,
      comment: '状态'
    }
  }, {
    tableName: 'question_categories'
  });

  return QuestionCategory;
};
