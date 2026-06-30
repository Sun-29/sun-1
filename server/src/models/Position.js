module.exports = (sequelize, DataTypes) => {
  const Position = sequelize.define('Position', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: '岗位名称'
    },
    category: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: '岗位分类 dev/test/ops/product/data'
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '岗位描述'
    },
    requirements: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '岗位要求'
    },
    salary_range: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: '薪资范围'
    },
    status: {
      type: DataTypes.TINYINT,
      defaultValue: 1,
      comment: '状态 1:正常 0:禁用'
    },
    sort_order: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: '排序'
    },
    icon: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: '图标'
    }
  }, {
    tableName: 'positions'
  });

  return Position;
};
