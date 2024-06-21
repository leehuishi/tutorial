const express = require('express');
const router = express.Router();

const { 
    createGroup,
    updateGroupByUsername
} = require('../controllers/groupControllers');

const { isAuthenticatedUser, authorizeGroups } = require('../middlewares/auth');

router.route('/group/new').post(isAuthenticatedUser, authorizeGroups('admin', 'super admin'), createGroup);
router.route('/group/:username').post(isAuthenticatedUser, authorizeGroups('admin', 'super admin'), updateGroupByUsername);


module.exports = router;