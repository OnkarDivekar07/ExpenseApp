const express = require('express');


//IMPORT CONTROLLERS 
const mainpageController = require('../controller/mainpage');

//CREATE AN INSTANCE OF Router
const router = express.Router();

//CREATE A ROUTER FOR MAINPAGE
router.get('/', mainpageController.gethomePage);
router.get('', mainpageController.geterrorPage)

module.exports = router;