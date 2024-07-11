const express = require('express');
const router = express.Router();

const { 
    createPlan,
    getAllPlan,
    checkPlan
} = require('../controllers/planControllers');

const { isAuthenticatedUser, authorizeGroups } = require('../middlewares/auth');

router.route('/plan/check').get(isAuthenticatedUser, authorizeGroups('project_manager'), checkPlan);
router.route('/plan/new/:appname').post(isAuthenticatedUser, authorizeGroups('project_manager'), createPlan);
router.route('/plan/all/:appname').get(isAuthenticatedUser, getAllPlan);





module.exports = router;