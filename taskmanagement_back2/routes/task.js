const express = require('express');
const router = express.Router();

const { 
    createTask,
    getAllTask,
    updateTaskPlan,
    getTaskNotes,
    addTaskNotes,
    updateTaskState,
    updateTaskStateDown
} = require('../controllers/taskControllers');

const { isAuthenticatedUser, authorizeGroups } = require('../middlewares/auth');

router.route('/task/new').post(isAuthenticatedUser, createTask);
router.route('/task/all/:appname').get(isAuthenticatedUser, getAllTask);
router.route('/task/update').put(isAuthenticatedUser, updateTaskPlan);
router.route('/task/state').put(isAuthenticatedUser, updateTaskState);
router.route('/task/statedown').put(isAuthenticatedUser, updateTaskStateDown);
router.route('/task/notes/:taskid').get(isAuthenticatedUser, getTaskNotes);
router.route('/task/addnotes/:taskid').put(isAuthenticatedUser, addTaskNotes);




module.exports = router;