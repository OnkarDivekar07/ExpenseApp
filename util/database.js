const Sequelize = require('sequelize');


const sequelize = new Sequelize('expensetracker', 'root', 'Divekar@210',
    {
        dialect: 'mysql',
        host: 'localhost'
    })

module.exports = sequelize