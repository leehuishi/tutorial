const express = require('express');
const router = express.Router();

//Importing job controller methods
const { 
    loginUser,
    logoutUser
} = require('../controllers/authControllers');

const { isAuthenticatedUser } = require('../middlewares/auth');

router.route('/login').post(loginUser);
router.route('/logout').get(isAuthenticatedUser, logoutUser);



module.exports = router;