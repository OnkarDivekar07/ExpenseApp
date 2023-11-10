const Sequelize = require('sequelize');


const sequelize = new Sequelize('expensetracker', process.env.user,process.env.password,
    {
        dialect: 'mysql',
        host: 'localhost'
    })

module.exports = sequelize