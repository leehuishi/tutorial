const express = require('express');
const router = express.Router();

const { 
    createGroup,
    updateGroupByUsername,
    checkGroup,
    getAllGroup
} = require('../controllers/groupControllers');

const { isAuthenticatedUser, authorizeGroups } = require('../middlewares/auth');

router.route('/group/new').post(isAuthenticatedUser, authorizeGroups('admin'), createGroup);
router.route('/group/all').get(isAuthenticatedUser, authorizeGroups('admin'), getAllGroup);
router.route('/group/:username').post(isAuthenticatedUser, authorizeGroups('admin'), updateGroupByUsername);
router.route('/group/check/:groupname').get(isAuthenticatedUser, authorizeGroups('admin'), checkGroup);


module.exports = router;