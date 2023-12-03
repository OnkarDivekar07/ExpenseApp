//imports
require('dotenv').config();
const express = require('express');
const app = express();
const sequelize = require('./util/database');
const cors = require('cors');
const path = require('path');


//models
const expense = require('./model/expensemodel')
const users = require('./model/userdetails')
const order = require('./model/order')
const Forgotpassword = require('./model/forgotpassword');


//routes
const mainpageroute = require('./routes/mainpageroute')
const user = require('./routes/user')
const expenseroute = require('./routes/expense')
const purchase = require('./routes/purchase')
const resetpassword = require('./routes/resetpassword')


//middlewares
app.use(cors())
app.use(express.json())


//static serving 
app.use(express.static(path.join(__dirname, 'public')));


//redirection
app.use(mainpageroute)
app.use('/user', user)
app.use('/expense', expenseroute)
app.use('/purchase', purchase)
app.use('/password', resetpassword)


// Define associations
users.hasMany(expense);
expense.belongsTo(users);

users.hasMany(order);
order.belongsTo(users);

users.hasMany(Forgotpassword);
Forgotpassword.belongsTo(users);




//this is to intialise database tables and then start the servers
sequelize.sync({})
    .then((result) => {

        app.listen(process.env.PORT);
    })
    .catch((err) => {
        console.log(err);
    })