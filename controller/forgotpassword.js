const uuid = require('uuid');
const sgMail = require('@sendgrid/mail');
const userdetailstable = require('../model/userdetails')
const bcrypt = require('bcrypt');
const Forgotpassword = require('../model/forgotpassword');





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


