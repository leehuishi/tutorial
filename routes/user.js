const express = require('express');
const router = express.Router();

const { 
    createUser,
    getAllUser,
    getOwnProfile,
    updateUserByUsername,
    updateOwnPassword,
    updateOwnEmail
} = require('../controllers/userControllers');

const { isAuthenticatedUser, authorizeGroups } = require('../middlewares/auth');

router.route('/user/me').get( isAuthenticatedUser, getOwnProfile);
router.route('/user/update/password').put( isAuthenticatedUser, updateOwnPassword);
router.route('/user/update/email').put( isAuthenticatedUser, updateOwnEmail);

router.route('/user/new').post(isAuthenticatedUser, authorizeGroups('admin', 'super admin'), createUser);
router.route('/user/all').get( isAuthenticatedUser, authorizeGroups('admin', 'super admin'), getAllUser);
router.route('/user/:username').put( isAuthenticatedUser, authorizeGroups('admin', 'super admin'), updateUserByUsername);


module.exports = router;