const uuid = require('uuid');
const sgMail = require('@sendgrid/mail');
const Sequelize = require('sequelize');
const userdetailstable =require('../model/userdetails')
const expense = require('../model/expensemodel');
const Razorpay = require('razorpay')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Order=require('../model/order')
const Forgotpassword = require('../model/forgotpassword');
const AWS=require('aws-sdk')


function uploadToS3(stringfyexpense, filename){
    const BUCKET_NAME =process.env.BUCKET_NAME;
    const IAM_USER_KEY=process.env.IAM_USER_KEY
    const SECRET_KEY = process.env.SECRET_KEY

    const s3Bucket=  new   AWS.S3({
        accessKeyId: IAM_USER_KEY,
        secretAccessKey: SECRET_KEY,
        Bucket:BUCKET_NAME
    })
        var params={
            Bucket:BUCKET_NAME,
            Key:filename,
            Body:stringfyexpense,
            ACL:'public-read'
        }

    return new Promise((resolve, reject)=>{
        s3Bucket.upload(params, (err, s3response) => {
            if (err) {
                console.log("something went wrong")
                reject(err)
            }
            else {
                console.log("sucess", s3response)
                resolve (s3response.Location)
            }
        })
    })
        
    
}



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
 
exports.forgotpassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await userdetailstable.findOne({ where: { email } });
        console.log(user)
        if (user) {
            const id = uuid.v4();
            user.createForgotpassword({ id, active: true })
                .catch(err => {
                    throw new Error(err)
                })

            sgMail.setApiKey(process.env.SENGRID_API_KEY)

            const msg = {
                to: email, // Change to your recipient
                from: 'onkardivekar07@gmail.com', // Change to your verified sender
                subject: 'Sending with SendGrid is Fun',
                text: 'and easy to do anywhere, even with Node.js',
                html: `<a href="http://localhost:4000/user/resetpassword/${id}">Reset password</a>`,
            }

            sgMail
                .send(msg)
                .then((response) => {

                    // console.log(response[0].statusCode)
                    // console.log(response[0].headers)
                    return res.status(response[0].statusCode).json({ message: 'Link to reset password sent to your mail ', sucess: true })

                })
                .catch((error) => {
                    throw new Error(error);
                })

            //send mail
        } else {
            throw new Error('User doesnt exist')
        }
    } catch (err) {
        console.error(err)
        return res.json({ message: err, sucess: false });
    }

}

exports.resetpassword = (req, res) => {
    const id = req.params.id;
    Forgotpassword.findOne({ where: { id } }).then(forgotpasswordrequest => {
        if (forgotpasswordrequest) {
            forgotpasswordrequest.update({ active: false });
            res.status(200).send(`<html>
                                    <script>
                                        function formsubmitted(e){
                                            e.preventDefault();
                                            console.log('called')
                                        }
                                    </script>

                                    <form action="/user/updatepassword/${id}" method="get">
                                        <label for="newpassword">Enter New password</label>
                                        <input name="newpassword" type="password" required></input>
                                        <button>reset password</button>
                                    </form>
                                </html>`
            )
            res.end()

        }
    })
}

exports.updatepassword = (req, res) => {

    try {
        const { newpassword } = req.query;
        const { resetpasswordid } = req.params;
        Forgotpassword.findOne({ where: { id: resetpasswordid } }).then(resetpasswordrequest => {
            User.findOne({ where: { id: resetpasswordrequest.userId } }).then(user => {
                // console.log('userDetails', user)
                if (user) {
                    //encrypt the password

                    const saltRounds = 10;
                    bcrypt.genSalt(saltRounds, function (err, salt) {
                        if (err) {
                            console.log(err);
                            throw new Error(err);
                        }
                        bcrypt.hash(newpassword, salt, function (err, hash) {
                            // Store hash in your password DB.
                            if (err) {
                                console.log(err);
                                throw new Error(err);
                            }
                            user.update({ password: hash }).then(() => {
                                res.status(201).json({ message: 'Successfuly update the new password' })
                            })
                        });
                    });
                } else {
                    return res.status(404).json({ error: 'No user Exists', success: false })
                }
            })
        })
    } catch (error) {
        return res.status(403).json({ error, success: false })
    }

}


exports.downloadExpenses = async (req, res) => {
    const data= await expense.findAll({ where: { userId: req.userId.userid } })
       console.log(data)
       const stringfyexpense=JSON.stringify(data)
   const userId= req.userId.userid
    const filename = `Expense${userId}/${new Date()}.txt`
       const fileurl=   await uploadToS3(stringfyexpense,filename)
    res.status(201).json({ fileurl, success: true })
};
