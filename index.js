const express=require('express');
const app=express();
const sequelize = require('./util/database');
const cors=require('cors');
const users=require('./routes/route')
app.use(cors())
app.use(express.json())

app.use('/user', users)


//this is to intialise database tables and then start the servers
sequelize.sync({})
    .then((result) => {

        app.listen(4000);
    })
    .catch((err) => {
        console.log(err);
    })
