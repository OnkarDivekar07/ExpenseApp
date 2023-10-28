const Sequelize = require('sequelize');
const userdetailstable =require('../model/userdetails')
const expense = require('../model/expensemodel');
const Razorpay = require('razorpay')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Order=require('../model/order')

function genrateAcesstoken(id, ispremiumuser){
    return jwt.sign({ userid: id, ispremiumuser: ispremiumuser },"8668442638@121021@24407#1722")
}
 

exports.signupdetails =  async (req, res, next) => {
        try {
            const Name = req.body.name;
            const email = req.body.email;
            const password = req.body.password;

            const saltRounds = 10; // You can adjust the number of salt rounds
            const hashedPassword = await bcrypt.hash(password, saltRounds);

            const existingUser = await userdetailstable.findOne({ where: { Email: email } });
            console.log(existingUser);
            if (existingUser == null) {
                const userinfo = await userdetailstable.create({ Name: Name, Email: email, password: hashedPassword });
                return res.json({ success: true, message: 'Account created successfully' });
            }
            else{
                return res.json({ success: false, message: 'Account created successfully' });
            }


        } 
        catch (e) {
            console.log(e);
            return res.status(500).json({ success: false, message: 'An error occurred' });
        }
    };

exports.logindetails = async (req, res) => {
    const { email, password } = req.body;
    try {
        // Find the user by email
        const user = await userdetailstable.findOne({ where: { Email: email } });

        if (user) {
            // Compare the provided password with the hashed password in the database
            const passwordMatch = await bcrypt.compare(password, user.password);

            if (passwordMatch) {
                // Passwords match, login successful
                console.log(user.ispremiumuser)
                const token = genrateAcesstoken(user.id,user.ispremiumuser);
                console.log(user.id)
                return res.json({ success: true, message: 'Login successful', token: token });
            } else {
                // Password doesn't match, return an error message
                return res.json({ success: false, message: 'Incorrect password' });
            }
        } else {
            // User not found with the provided email, return an error message
            return res.json({ success: false, message: 'User not found' });
        }
    }

    catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: 'An error occurred' });
    }
};
exports.getexpense = (req, res) => {
    console.log('expense data send');
    console.log(req.userId.userid)
    expense.findAll({ where: { userId: req.userId.userid } })
        .then((result) => {
             res.send(result);
        })
        .catch((err) => {
            console.log(err);
        });
};

exports.postexpense = async (req, res, next) => {
    try {
        const amount = parseInt(req.body.amount, 10)
        const description = req.body.description;
        const catogary = req.body.catogary;
        const userId = req.userId.userid;
        // Create a new expense
        const newExpense = await expense.create({
            amount,
            description,
            catogary,
            userId,
        });
        // Update the totalExpenses column in the users table
        const user = await userdetailstable.findByPk(userId);
        if (user) {
            if (user.totalExpenses === null) {
                user.totalExpenses = amount;
            } else {
                user.totalExpenses += amount; // Add the new expense amount
            }
            await user.save();
        }

        res.json(newExpense);
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'An error occurred' });
    }
};


exports.putexpense = (req, res) => {
    console.log('expense updated');
    const id = req.params.id;
    const amount = req.body.amount;
    const description = req.body.description;
    const category = req.body.category
    expense.findByPk(id)
        .then(updated => {
            updated.amount = amount;
            updated.description = description;
            updated.category = category;
            return updated.save();
        })
        .then(updateddata => {
            res.json(updateddata);
        })
        .catch(err => console.log(err));
}

exports.deleteexpense = (req, res) => {
    console.log('row deleted');
    const id = req.params.id;

    expense.findByPk(id)
        .then(data => {
            if (!data) {
                // Handle the case where the record with the specified ID was not found.
                return res.status(404).send('Expense not found');
            }

            return data.destroy()
                .then(() => {
                    res.send('Successfully deleted');
                })
        })
        .catch(err => {
            res.status(500).send('Internal Server Error');
        });
}


exports.purchasepremium = async (req, res) => {
    try {
        var rzp = new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET })
        const amount = 2500;
    rzp.orders.create({amount,currency: "INR" },(err, order) => {
          // console.log(order)
            if (err) {
               console.log("it is errror")
            }
        Order.create({ orderid: order.id, status: "PENDING" }).then(()=>{
        return res.status(201).json({ order, key_id: rzp.key_id });
     }).catch (err=>{
        throw new Error(err);
         })
        })    
    }catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

exports.updatetranctionstatus = async (req, res) => {
    
    try {
        const { payment_id,order_id } = req.body;
      const order= await Order.findOne({ where: { orderid: order_id } })
        const promise1 = order.update({ paymentid: payment_id, status: 'successful' }, { where: { orderid: order_id } })
        const promise2 = userdetailstable.update({ ispremiumuser: true }, { where: { id: req.userId.userid}})
        Promise.all([promise1,promise2]).then(()=>{
        return res.status(202).json({ success: true, message: "Transaction successful" });
    }).catch((err)=>{
        throw new Error(err)
    })
     } catch (error) {
        throw new Error(error);
    }
};


exports.leaderboard = async (req, res) => {
    try {
        // Assuming you have Sequelize models for user details (users)
        const leaderboardData = await userdetailstable.findAll({
            attributes: ['id', 'Name', 'totalExpenses'],
            order: [['totalExpenses', 'DESC']],
        });

        res.json(leaderboardData);
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'An error occurred' });
    }
};
