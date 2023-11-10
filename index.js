//imports
require('dotenv').config();
const express = require('express');
const app = express();
const sequelize = require('./util/database');
const cors = require('cors');
const helmet=require('helmet')
const fs = require('fs');
const path = require('path');

//models
const expense = require('./model/expensemodel')
const users = require('./model/userdetails')
const order = require('./model/order')
const Forgotpassword = require('./model/forgotpassword');

//routes
const user = require('./routes/user')
const expenseroute = require('./routes/expense')
const purchase = require('./routes/purchase')
const resetpassword = require('./routes/resetpassword')


const errorLogStream = fs.createWriteStream(path.join(__dirname, 'error.log'), { flags: 'a' });

//middlewares
app.use(cors())
app.use(express.json())
app.use(helmet())

//redirection
app.use('/user', user)
app.use('/expense', expenseroute)
app.use('/purchase', purchase)
app.use('/resetpassword', resetpassword)


//error loging middleware
app.use((err, req, res, next) => {
    // Log the error to the error.log file
    errorLogStream.write(`${new Date().toISOString()} - ${err.stack}\n`);
    res.status(500).send('Something failed!');
});


// Define associations
expense.belongsTo(users, { foreignKey: 'userId' });
users.hasMany(expense, { foreignKey: 'userId' });
order.belongsTo(users)
users.hasMany(Forgotpassword);
Forgotpassword.belongsTo(users);

//this is to intialise database tables and then start the servers
sequelize.sync({})
    .then((result) => {

        app.listen(process.env.PORT);
    })
    .catch((err) => {
        errorLogStream.write(`${new Date().toISOString()} - Database Sync Error: ${err.stack}\n`);
        console.log('Error syncing the database:', err);
    })