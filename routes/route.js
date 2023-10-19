const express = require('express')

const router = express.Router();

const Controller = require('../controller/controller')



router.post('/signup', Controller.signupdetails)
router.post('/login',Controller.logindetails)
router.delete(`/deleteexpense/:id`, Controller.deleteexpense)

router.get('/getexpenses', Controller.getexpense)

router.put(`/editexpense/:id`, Controller.putexpense)
router.post('/postexpense', Controller.postexpense);






module.exports = router;