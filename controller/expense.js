
const userdetailstable = require('../model/userdetails')
const expense = require('../model/expensemodel');
const AWS = require('aws-sdk')


function uploadToS3(stringfyexpense, filename) {
    const BUCKET_NAME = process.env.BUCKET_NAME;
    const IAM_USER_KEY = process.env.IAM_USER_KEY
    const SECRET_KEY = process.env.SECRET_KEY

    const s3Bucket = new AWS.S3({
        accessKeyId: IAM_USER_KEY,
        secretAccessKey: SECRET_KEY,
        Bucket: BUCKET_NAME
    })
    var params = {
        Bucket: BUCKET_NAME,
        Key: filename,
        Body: stringfyexpense,
        ACL: 'public-read'
    }

    return new Promise((resolve, reject) => {
        s3Bucket.upload(params, (err, s3response) => {
            if (err) {
                console.log("something went wrong")
                reject(err)
            }
            else {
                console.log("sucess", s3response)
                resolve(s3response.Location)
            }
        })
    })


}





exports.getexpense = (req, res) => {
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
        res.status(500).json({ success: false, message: 'An error occurred' });
    }
};


exports.deleteexpense = (req, res) => {
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



exports.downloadExpenses = async (req, res) => {
    const data = await expense.findAll({ where: { userId: req.userId.userid } })
    console.log(data)
    const stringfyexpense = JSON.stringify(data)
    const userId = req.userId.userid
    const filename = `Expense${userId}/${new Date()}.txt`
    const fileurl = await uploadToS3(stringfyexpense, filename)
    res.status(201).json({ fileurl, success: true })
};