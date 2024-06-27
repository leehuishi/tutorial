const express = require('express');
const router = express.Router();

const { 
    createUser,
    getAllUser,
    getOwnProfile,
    updateUserByUsername,
    updateOwnPassword,
    updateOwnEmail,
    getCheckIsAdmin,
    checkUser
} = require('../controllers/userControllers');

const { isAuthenticatedUser, authorizeGroups } = require('../middlewares/auth');

router.route('/user/me').get( isAuthenticatedUser, getOwnProfile);
router.route('/user/isadmin').get( isAuthenticatedUser, getCheckIsAdmin);
router.route('/user/update/password').put( isAuthenticatedUser, updateOwnPassword);
router.route('/user/update/email').put( isAuthenticatedUser, updateOwnEmail);

router.route('/user/new').post(isAuthenticatedUser, authorizeGroups('admin'), createUser);
router.route('/user/all').get( isAuthenticatedUser, authorizeGroups('admin'), getAllUser);
router.route('/user/:username').put( isAuthenticatedUser, authorizeGroups('admin'), updateUserByUsername);
router.route('/user/:username').get( isAuthenticatedUser, authorizeGroups('admin'), checkUser);


module.exports = router;