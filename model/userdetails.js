const Sequelize = require('sequelize');
const sequelize = require('../util/database');

const users = sequelize.define('users', {
    id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
    },
    Name: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    Email: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    password: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    ispremiumuser: Sequelize.BOOLEAN,
    totalExpenses: Sequelize.INTEGER
});

module.exports = users;
