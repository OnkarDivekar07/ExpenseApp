const  userdetailstable=require('../model/userdetails')
const bcrypt = require('bcrypt');



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
                return res.json({ success: true, message: 'Login successful' });
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
