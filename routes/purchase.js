const express = require('express')

const router = express.Router();

const Controller = require('../controller/purchase')

const userauthenticate = require('../middleware/auth')


router.get('/purchasepremium', userauthenticate.verifyToken, Controller.purchasepremium)
router.post('/updatetranctionstatus', userauthenticate.verifyToken, Controller.updatetranctionstatus);



module.exports = router;