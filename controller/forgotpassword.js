const uuid = require('uuid');
const formData = require('form-data');
require('dotenv').config();
const Mailgun = require('mailgun.js');
const userdetailstable=require('../model/userdetails')



exports.forgotpassword = async (req, res) => {
    const mailgun = new Mailgun(formData);
    const client = mailgun.client({
        username: 'api',
        key: process.env.MAILGUN_API_KEY,
        domain: process.env.MAILGUN_DOMAIN,
    });
    try {
        const { email } = req.body;
        const user = await userdetailstable.findOne({ where: { email } });

        if (user) {
            const id = uuid.v4();
            user.createForgotpassword({ id, active: true });

            const link = `http://43.205.116.5:${process.env.PORT}/resetpassword/resetpassword/${id}`;
            const messageData = {
                from: 'Excited User <onkardivekar07@gmail.com>',
                to: email,
                subject: 'Reset Password',
                text: `Click on the following link to reset your password: ${link}`,
                html: `<a href="${link}">Reset password</a>`,
            };

            client.messages.create(process.env.MAILGUN_DOMAIN, messageData)
                .then(() => {
                    return res.status(202).json({ message: 'Link to reset password sent to your mail', success: true });
                })
                .catch(error => {
                    console.error('Mailgun Error:', error);
                    throw new Error('Error in sending email');
                });
        } else {
            throw new Error("User doesn't exist");
        }
    } catch (err) {
        console.error('General Error:', err);
        return res.json({ message: err.message || 'An error occurred', success: false });
    }
};


// The rest of your code remains the same...

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

                                    <form action="/resetpassword/updatepassword/${id}" method="get">
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


