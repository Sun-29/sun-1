const bcrypt = require('bcryptjs');

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    openid: {
      type: DataTypes.STRING(100),
      unique: true,
      allowNull: true,
      comment: '微信OpenID'
    },
    phone: {
      type: DataTypes.STRING(20),
      unique: true,
      allowNull: true,
      comment: '手机号'
    },
    email: {
      type: DataTypes.STRING(100),
      unique: true,
      allowNull: true,
      comment: '邮箱'
    },
    password_hash: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: '密码哈希'
    },
    nickname: {
      type: DataTypes.STRING(50),
      allowNull: true,
      defaultValue: '新用户',
      comment: '昵称'
    },
    avatar_url: {
      type: DataTypes.STRING(500),
      allowNull: true,
      comment: '头像URL'
    },
    school: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: '学校'
    },
    major: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: '专业'
    },
    grade: {
      type: DataTypes.STRING(20),
      allowNull: true,
      comment: '年级'
    },
    job_direction: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: '求职方向'
    },
    status: {
      type: DataTypes.TINYINT,
      defaultValue: 1,
      comment: '状态 1:正常 0:禁用'
    },
    last_login: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      comment: '最后登录日期'
    }
  }, {
    tableName: 'users',
    hooks: {
      beforeCreate: async (user) => {
        if (user.password_hash && !user.password_hash.startsWith('$2a$')) {
          user.password_hash = await bcrypt.hash(user.password_hash, 10);
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed('password_hash') && user.password_hash && !user.password_hash.startsWith('$2a$')) {
          user.password_hash = await bcrypt.hash(user.password_hash, 10);
        }
      }
    }
  });

  User.prototype.validatePassword = async function (password) {
    if (!this.password_hash) return false;
    return bcrypt.compare(password, this.password_hash);
  };

  User.prototype.toJSON = function () {
    const values = { ...this.get() };
    delete values.password_hash;
    return values;
  };

  return User;
};
