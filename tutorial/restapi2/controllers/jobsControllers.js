const sqlcon = require('../models/jobs');

const ErrorHandler = require('../utils/errorHandler');
const catchAsyncErrors = require('../middlewares/catchAsyncErrors');

// Get all Jobs => http://localhost:3000/jobs
module.exports.getJobs = (req, res, next) => {
    res.status(200).json({
        success: true,
        middleware_user: req.user,
        message: 'This route will display all jobs'
    });
}

// test connection of sql => http://localhost:3000/jobs/all
module.exports.getJobs2 = async (req, res, next) => {
    await sqlcon.query(
        'select * from people',
        function(err, rows) {
            if (err){
                throw err;
            }
            else{
                res.status(200).json({
                    success: true,
                    data: rows,
                });
            }
            
        }
    )
}

//Create a new Job => http://localhost:3000/jobs/new
module.exports.newJobs = (req, res, next) => {
    const job = req.body;
    const date = new Date();

    const insertdata = [job.title, job.description, job.email, job.address, job.company, job.industry, job.jobType, job.minEducation, job.positions, job.experience, job.salary, date, date];
    const insertcol = ['title', 'description', 'email', 'address', 'company', 'industry', 'jobType', 'minEducation', 'positions', 'experience, salary', 'postingDate', 'lastDate'];

    const joindata = "'" + insertdata.join("' , '") + "'";
    const joincol = insertcol.join();

    // console.log(joindata);
    // console.log(joincol);

    const query = 'INSERT INTO jobs (' + joincol + ') VALUES (' + joindata + ')';

    sqlcon.query(
        query,
        function(err, rows) {
            if (err){
                throw err;
            }
            else{
                res.status(200).json({
                    success: true,
                    message: 'Job Created.',
                    data: job
                });
            }
            
        }
    )
}


//Update a Job => http://localhost:3000/jobs/1
module.exports.updateJob = catchAsyncErrors (async (req, res, next) => {
    const query = 'select * from jobs where id = ' + req.params.id;

    await sqlcon.query(
        query,
        function(err, rows) {
            if (err){
                throw err;
            }
            else{
                if(rows.length < 1){
                    //without errorHandling
                    // return res.status(404).json({
                    //     success: false,
                    //     message: 'Job not found'
                    // });

                    //errorHandling
                    return next(new ErrorHandler('Job not found', 404));
                }
                else{
                    res.status(200).json({
                        success: true,
                        message: 'Job Found.',
                        data: rows
                    });
                }
            }
        }
    );

    //add the update query here!!!!!!!


});