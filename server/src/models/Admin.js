const bcrypt = require('bcryptjs');

module.exports = (sequelize, DataTypes) => {
  const Admin = sequelize.define('Admin', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    username: {
      type: DataTypes.STRING(50),
      unique: true,
      allowNull: false,
      comment: '用户名'
    },
    password_hash: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: '密码哈希'
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: '邮箱'
    },
    role: {
      type: DataTypes.STRING(20),
      defaultValue: 'admin',
      comment: '角色 admin/superadmin'
    },
    avatar: {
      type: DataTypes.STRING(500),
      allowNull: true,
      comment: '头像'
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
    tableName: 'admins',
    hooks: {
      beforeCreate: async (admin) => {
        if (!admin.password_hash.startsWith('$2a$')) {
          admin.password_hash = await bcrypt.hash(admin.password_hash, 10);
        }
      },
      beforeUpdate: async (admin) => {
        if (admin.changed('password_hash') && !admin.password_hash.startsWith('$2a$')) {
          admin.password_hash = await bcrypt.hash(admin.password_hash, 10);
        }
      }
    }
  });

  Admin.prototype.validatePassword = async function (password) {
    return bcrypt.compare(password, this.password_hash);
  };

  Admin.prototype.toJSON = function () {
    const values = { ...this.get() };
    delete values.password_hash;
    return values;
  };

  return Admin;
};
