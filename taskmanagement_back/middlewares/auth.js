const dbconnection = require('../config/configdb');
const jwt = require('jsonwebtoken');
const catchAsyncErrors = require('../middlewares/catchAsyncErrors');
const ErrorHandler = require('../utils/errorHandler');


const Checkgroup = (userid, groupname) => {
    return new Promise((resolve, reject) => {
        const query = 'SELECT groupname FROM tms_usergroups WHERE username = ? and groupname = ?';

        dbconnection.query(
            query,
            [userid, groupname],
            function(err, rows) {
                if (err) {
                    // Reject the promise with the error
                    reject(err);
                } else {
                    // Check if rows exist
                    if (rows.length > 0) {
                        resolve(true); // Found groupname for userid
                    } else {
                        resolve(false); // Did not find groupname for userid
                    }
                }
            }
        );
    });
};

module.exports.Checkgroup = Checkgroup;

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
    return async(req, res, next) => {
        try {
            const results = await Promise.all(groups.map(group => Checkgroup(req.user.username, group)));

            // Check all results
            const ingroup = results.some(result => result); // true if user is in any group

            if (ingroup) {
                next(); // User is authorized to proceed
            } else {
                return next(new ErrorHandler(`User is not allowed to access this resource.`, 403));
            }
        }
        catch(err){
            // Handle error appropriately
            console.error("Error authorizing groups:", err);
            return next(new ErrorHandler(`Error authorizing groups: ${err.message}`, 500));
        }
    }
}
