const { Sequelize } = require('sequelize');
require('dotenv').config();

// Если есть переменная DATABASE_URL (в облаке), используем её, иначе локальные настройки
let sequelize;

if (process.env.DATABASE_URL) {
    sequelize = new Sequelize(process.env.DATABASE_URL, {
        dialect: 'postgres',
        dialectOptions: { ssl: { require: true, rejectUnauthorized: false } },
        logging: false
    });
} else {
    sequelize = new Sequelize({ dialect: 'sqlite', storage: './database.sqlite', logging: false });
}

module.exports = sequelize;