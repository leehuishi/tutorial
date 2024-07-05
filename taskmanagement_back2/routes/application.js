const express = require('express');
const router = express.Router();

const { 
    createApp,
    getAllApp,
    checkApp,
    updateApp,
    getApp
} = require('../controllers/appControllers');

const { isAuthenticatedUser, authorizeGroups } = require('../middlewares/auth');

router.route('/app/new').post(isAuthenticatedUser, authorizeGroups('project_lead'), createApp);
router.route('/app/all').get(isAuthenticatedUser, getAllApp);
router.route('/app/update').put(isAuthenticatedUser, authorizeGroups('project_lead'), updateApp);
router.route('/app/check/:appname').get(isAuthenticatedUser, authorizeGroups('project_lead'), checkApp);
router.route('/app/:appname').get(isAuthenticatedUser, getApp);




module.exports = router;