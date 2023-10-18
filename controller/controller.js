const  userdetailstable=require('../model/userdetails')



exports.signupdetails = async (req, res, next) => {
    try {

        const Name = req.body.name;
        const email = req.body.email
        const password = req.body.password

        const userinfo = await userdetailstable.create({ Name: Name, Email: email, password: password })
        return res.json(userinfo)
    } catch (e) {
        console.log(e)
        return res.status(500).json({ success: false })
    }
};