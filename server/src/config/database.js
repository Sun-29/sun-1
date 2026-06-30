const { Sequelize } = require('sequelize');
const config = require('./index');

const sequelize = new Sequelize(config.db.database, config.db.username, config.db.password, {
  host: config.db.host,
  port: config.db.port,
  dialect: 'mysql',
  logging: config.nodeEnv === 'development' ? (msg) => console.log('[SQL]', msg) : false,
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  define: {
    timestamps: true,
    underscored: true,
    charset: 'utf8mb4',
    collate: 'utf8mb4_unicode_ci'
  },
  timezone: '+08:00',
  dialectOptions: {
    charset: 'utf8mb4',
    dateStrings: true,
    typeCast: true
  }
});

async function initDatabase() {
  try {
    await sequelize.authenticate();
    console.log('[DB] Connection established successfully.');

    // Sync all models (development only)
    if (config.nodeEnv === 'development') {
      await sequelize.sync({ alter: true });
      console.log('[DB] Models synchronized.');
    }

    return sequelize;
  } catch (error) {
    console.error('[DB] Unable to connect:', error.message);
    throw error;
  }
}

module.exports = { sequelize, initDatabase };
