const express = require('express');
const router = express.Router();

const { 
    createUser,
    getAllUser,
    getOwnProfile,
    getUserById
} = require('../controllers/userControllers');

const { isAuthenticatedUser, authorizeRoles } = require('../middlewares/auth');

router.route('/user/new').post(isAuthenticatedUser, createUser);
router.route('/user/all').get( isAuthenticatedUser, getAllUser);
router.route('/user/me').get( isAuthenticatedUser, getOwnProfile);
router.route('/user/:id').get( isAuthenticatedUser, authorizeRoles('admin'), getUserById);

module.exports = router;