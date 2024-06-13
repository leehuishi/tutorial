const dbconnection = require('../config/configdb');
const jwt = require('jsonwebtoken');
const catchAsyncErrors = require('../middlewares/catchAsyncErrors');
const ErrorHandler = require('../utils/errorHandler');

//==================================================================
//check if user is authenicated or not
//==================================================================
module.exports.isAuthenticatedUser = catchAsyncErrors( async (req, res, next) => {
    let token;

    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
        token = req.headers.authorization.split(' ')[1];
    }

    if(!token) {
        return next(new ErrorHandler('Login first to access this resource.', 401));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const query = 'SELECT * FROM accounts WHERE id =' + decoded.id;

    dbconnection.query(
        query,
        function(err, rows) {
            if (err){
                return next(new ErrorHandler('The database server is unavailable, or there is a syntax error in the database query.', 500));
                // throw err;
            }
            else{
                req.user = rows[0];

                next();
            }
            
        }
    )

});

//==================================================================
//handling user roles
//==================================================================
// module.exports.authorizeRoles = (...roles) => {
//     return (req, res, next) => {
//         console.log(req.user.role);
        
//         if(!roles.includes(req.user.role)){
//             return next(new ErrorHandler(`Role(${req.user.role}) is not allowed to access this resources.`, 403))
//         }
//         next();
//     }
// }
