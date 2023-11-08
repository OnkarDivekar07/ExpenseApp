const express = require('express')

const router = express.Router();

const Controller = require('../controller/forgotpassword')

const userauthenticate = require('../middleware/auth')




router.get('/updatepassword/:resetpasswordid', Controller.updatepassword)

router.get('/resetpassword/:id', Controller.resetpassword)

router.use('/forgotpassword', Controller.forgotpassword)


module.exports = router;