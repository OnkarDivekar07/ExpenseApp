const express = require('express')

const router = express.Router();

const Controller = require('../controller/controller')



router.post('/signup', Controller.signupdetails)
router.post('/login',Controller.logindetails)







module.exports = router;