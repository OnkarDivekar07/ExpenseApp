const express = require('express')

const router = express.Router();

const Controller = require('../controller/controller')
const userauthenticate=require('../middleware/auth')


router.post('/signup', Controller.signupdetails)
router.post('/login',Controller.logindetails)
router.delete(`/deleteexpense/:id`,Controller.deleteexpense)

router.get('/getexpenses', userauthenticate.verifyToken,Controller.getexpense)

router.put(`/editexpense/:id`, Controller.putexpense)
router.post('/postexpense', userauthenticate.verifyToken,Controller.postexpense);
router.get('/purchasepremium', userauthenticate.verifyToken, Controller.purchasepremium)
router.post('/updatetranctionstatus', userauthenticate.verifyToken, Controller.updatetranctionstatus);







module.exports = router;