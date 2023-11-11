const Sequelize = require('sequelize');


const sequelize = new Sequelize(process.env.DB_NAME, process.env.user,process.env.DB_password,
    {
        dialect: 'mysql',
        host: process.env.Host
    })

module.exports = sequelize