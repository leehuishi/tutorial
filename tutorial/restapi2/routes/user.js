const express = require('express');
const router = express.Router();

const { getUserProfile } = require('../controllers/userControllers');
const { isAuthenticatedUser } = require('../middlewares/auth');

router.route('/me').get(isAuthenticatedUser, getUserProfile);

module.exports = router;