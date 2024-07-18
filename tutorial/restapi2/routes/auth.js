const express = require('express');
const router = express.Router();

//Importing job controller methods
const { 
    registerUser, 
    loginUser,
    logout
} = require('../controllers/authControllers');

const { isAuthenticatedUser } = require('../middlewares/auth');

router.route('/register').post(registerUser);
router.route('/login').post(loginUser);
router.route('/logout').get(isAuthenticatedUser, logout);


module.exports = router;