const express = require('express');
const router = express.Router();

//Importing job controller methods
const {getJobs, getJobs2, newJobs, updateJob } = require('../controllers/jobsControllers');

const { isAuthenticatedUser, authorizeRoles } = require('../middlewares/auth');


router.route('/jobs').get(getJobs);
router.route('/jobs/all').get(getJobs2);
router.route('/jobs/new').post(isAuthenticatedUser, authorizeRoles('employeer', 'admin'), newJobs);
router.route('/jobs/:id').put(isAuthenticatedUser, updateJob);

//If without controller folder
// router.get('/jobs', (req, res) =>{
//     res.status(200).json({
//         success: true,
//         message: 'This route will display all jobs'
//     });
// })


module.exports = router;