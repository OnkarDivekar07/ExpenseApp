require('dotenv').config();
const express=require('express');
const app=express();
const sequelize = require('./util/database');
const expense=require('./model/expensemodel')
const users=require('./model/userdetails')
const order = require('./model/order')
const Forgotpassword = require('./model/forgotpassword');


const cors=require('cors');
const user=require('./routes/route')

app.use(cors())
app.use(express.json())

app.use('/user',user)

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
