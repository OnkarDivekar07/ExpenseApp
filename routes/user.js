const express = require('express')

const router = express.Router();

const Controller = require('../controller/user')
const userauthenticate = require('../middleware/auth')


router.post('/signup', Controller.signupdetails)
router.post('/login', Controller.logindetails)


module.exports = router;