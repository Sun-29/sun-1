module.exports = (sequelize, DataTypes) => {
  const Question = sequelize.define('Question', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    category_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: '分类ID'
    },
    position_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: '岗位ID'
    },
    title: {
      type: DataTypes.STRING(500),
      allowNull: false,
      comment: '题目标题'
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: '题目内容'
    },
    type: {
      type: DataTypes.ENUM('basic', 'scenario', 'project', 'open', 'behavioral', 'hr'),
      defaultValue: 'basic',
      comment: '题目类型'
    },
    difficulty: {
      type: DataTypes.ENUM('junior', 'mid', 'senior'),
      defaultValue: 'junior',
      comment: '难度'
    },
    reference_answer: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '参考答案'
    },
    tags: {
      type: DataTypes.STRING(500),
      allowNull: true,
      comment: '标签 逗号分隔'
    },
    score: {
      type: DataTypes.INTEGER,
      defaultValue: 10,
      comment: '默认分值'
    },
    usage_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: '使用次数'
    },
    status: {
      type: DataTypes.TINYINT,
      defaultValue: 1,
      comment: '状态 1:正常 0:禁用'
    }
  }, {
    tableName: 'questions'
  });

  return Question;
};
