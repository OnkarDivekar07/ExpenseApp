const express = require('express')

const router = express.Router();

const Controller = require('../controller/expense')

const userauthenticate = require('../middleware/auth')


router.get('/getexpenses', userauthenticate.verifyToken, Controller.getexpense)

router.put(`/editexpense/:id`, Controller.putexpense)

router.post('/postexpense', userauthenticate.verifyToken, Controller.postexpense);

router.delete(`/deleteexpense/:id`, Controller.deleteexpense)

router.get('/download', userauthenticate.verifyToken, Controller.downloadExpenses)

router.get('/leaderboard', userauthenticate.verifyToken, Controller.leaderboard)






module.exports = router;