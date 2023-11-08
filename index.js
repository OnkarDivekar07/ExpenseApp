//imports
require('dotenv').config();
const express = require('express');
const app = express();
const sequelize = require('./util/database');
const cors = require('cors');

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

//middlewares
app.use(cors())
app.use(express.json())

//redirection
app.use('/user', user)
app.use('/expense', expenseroute)
app.use('/purchase', purchase)
app.use('/resetpassword', resetpassword)

// Define associations
expense.belongsTo(users, { foreignKey: 'userId' });
users.hasMany(expense, { foreignKey: 'userId' });
order.belongsTo(users)
users.hasMany(Forgotpassword);
Forgotpassword.belongsTo(users);

//this is to intialise database tables and then start the servers
sequelize.sync({})
    .then((result) => {

        app.listen(4000);
    })
    .catch((err) => {
        console.log(err);
    })
