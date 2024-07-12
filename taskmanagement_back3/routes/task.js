const express = require('express');
const router = express.Router();

const { 
    createTask,
    getAllStateTask,
    updateTaskStatetoDone
} = require('../controllers/taskControllers');

router.route('/CreateTask').post(createTask);
router.route('/GetTaskByState').get(getAllStateTask);
router.route('/PromoteTask2Done').patch(updateTaskStatetoDone);


module.exports = router;