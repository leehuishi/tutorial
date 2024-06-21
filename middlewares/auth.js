const dbconnection = require('../config/configdb');
const jwt = require('jsonwebtoken');
const catchAsyncErrors = require('../middlewares/catchAsyncErrors');
const ErrorHandler = require('../utils/errorHandler');

//==================================================================
//check if user is authenicated or not
//==================================================================
module.exports.isAuthenticatedUser = (req, res, next) => {
    let token;

    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
        token = req.headers.authorization.split(' ')[1];
    }

    if(!token) {
        return next(new ErrorHandler('Login first to access this resource.', 401));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const query = 'SELECT * FROM tms_users WHERE username = ?';

    if(req.ip !== decoded.ip){
        return next(new ErrorHandler('Login first to access this resource.', 401));
    }

    if(req.headers['user-agent'] !== decoded.browser){
        return next(new ErrorHandler('Login first to access this resource.', 401));
    }

    dbconnection.query(
        query,
        [decoded.username],
        function(err, rows) {
            if (err){
                return next(new ErrorHandler('The database server is unavailable, or there is a syntax error in the database query.', 500));
                // throw err;
            }
            else{
                if(rows.length < 1){
                    return next(new ErrorHandler(`User does not exist.`, 400));
                }
                
                req.user = rows[0];

                next();
            }
            
        }
    )

};

//==================================================================
//handling user roles
//==================================================================
module.exports.authorizeGroups = (...groups) => {
    return (req, res, next) => {
        //get current user groups with username (req.user.username)
        const query = 'SELECT groupname FROM tms_usergroups WHERE username = ?';


        dbconnection.query(
            query,
            [req.user.username],
            function(err, rows) {
                if (err){
                    // return next(new ErrorHandler('The database server is unavailable, or there is a syntax error in the database query.', 500));
                    throw err;
                }
                else{
                    if(rows.length > 0){
                        var ingroup = false;
                        for(let i = 0; i < rows.length; i++){
                            const groupname = rows[i].groupname;
                            if(groups.includes(groupname)){
                                ingroup = true;
                            }
                        }

                        if(ingroup){
                            next();
                        }
                        else{
                            return next(new ErrorHandler(`User is not allowed to access this resources.`, 403));
                        }
                    }
                    else{
                        return next(new ErrorHandler(`User is not allowed to access this resources.`, 403));
                    }
                }
            }
        )
    }
}
