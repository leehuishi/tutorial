const sqlcon = require('../models/jobs');
const ErrorHandler = require('../utils/errorHandler');
const catchAsyncErrors = require('../middlewares/catchAsyncErrors');

//Get current user profile
module.exports.getUserProfile = (req, res, next) => {
    sqlcon.query(
        'select user_id, username from user where user_id = "' + req.user.user_id + '" ',
        function(err, rows) {
            if (err){
                throw err;
            }
            else{
                res.status(200).json({
                    success: true,
                    data: rows[0],
                });
            }
            
        }
    )
}