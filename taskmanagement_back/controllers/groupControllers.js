const dbconnection = require('../config/configdb');

const catchAsyncErrors = require('../middlewares/catchAsyncErrors');
const ErrorHandler = require('../utils/errorHandler');


function checkgroupname(groupname){
    //alphanumeric and underscore
    //length of 4 to 32
    const regex = /^[a-zA-Z0-9_]{4,32}$/;

    if(!regex.test(groupname)){
        return false;
    }
    else{
        return true;
    }
}

//==================================================================
//create new group
//==================================================================
module.exports.createGroup = catchAsyncErrors (async (req, res, next) => {
    if(!req.body){
        return next(new ErrorHandler('No input', 400));
    }
    else if(!req.body.groupname){
        return next(new ErrorHandler('Please provide new group name.', 400));
    }

    //--------------------------------------------------------------
    //handle group name
    //--------------------------------------------------------------
    //check groupname format
    const checkgn = checkgroupname(req.body.groupname);

    if(!checkgn){
        return next(new ErrorHandler('Invalid group name format', 400));
    }
    //--------------------------------------------------------------

    const groupname = req.body.groupname;

    const query = 'INSERT INTO tms_grp VALUES (?)';

    dbconnection.query(
        query,
        groupname,
        function(err, rows) {
            if (err){
                if(err.code === "ER_DUP_ENTRY"){
                    return next(new ErrorHandler('Group Exist. Please use another group name', 500));
                }
                else{
                    return next(new ErrorHandler('The database server is unavailable, or there is a syntax error in the database query.', 500));
                }

                // throw err;
            }
            else{
                res.status(200).json({
                    success: true,
                    message: "Group created successful"
                });
            }
            
        }
    )
});


//==================================================================
//Update group by username
//==================================================================
module.exports.updateGroupByUsername = catchAsyncErrors (async (req, res, next) => {
    if(!req.params.username){
        return next(new ErrorHandler('Missing required parameter.', 400));
    }

    if(!req.body.groups){
        return next(new ErrorHandler('Missing required parameter.', 400));
    }

    const groups = req.body.groups;
    const groupslist = '"' + groups.join('", "') + '"';

    //check and remove pairs if user has been removed from the group
    dbconnection.query(
        'SELECT groupname FROM tms_usergroups where username = ? and groupname not in ('+ groupslist +')',
        [req.params.username],
        function(err, rows) {
            if (err){
                // return next(new ErrorHandler('The database server is unavailable, or there is a syntax error in the database query.', 500));
                throw err;
            }
            else{
                if(rows.length > 0){
                    //remove pairs 
                    for(let i2 = 0; i2 < rows.length; i2++){
                        dbconnection.query(
                            'DELETE FROM tms_usergroups WHERE username = ? and groupname = ?',
                            [req.params.username, rows[i2].groupname],
                            function(err2, rows2) {
                                if (err2){
                                    // return next(new ErrorHandler('The database server is unavailable, or there is a syntax error in the database query.', 500));
                                    throw err;
                                }
                            }
                        )
                    }
                }
            }
            
        }
    )

    //add pairs if user has been added into a group
    let queriesCompleted = 0;

    if(groups.length > 0){
        groups.forEach((group, index) => {
            //check and remove pairs if user has been removed from the group
            dbconnection.query(
                'insert into tms_usergroups (username, groupname) value (? , ?)',
                [req.params.username, group],
                function(err, rows) {
                    if (err){
                        if (err.code === "ER_NO_REFERENCED_ROW_2"){
                            return next(new ErrorHandler('Invalid group provided', 400));
                        }
                        else if (err.code === "ER_DUP_ENTRY"){
                            queriesCompleted++;

                            if (queriesCompleted === groups.length) {
                                res.status(200).json({
                                    success: true,
                                    message: "Group updated successful",
                                });
                            }
                            else{
                                return;
                            }
                        }
                        else{
                            // return next(new ErrorHandler('The database server is unavailable, or there is a syntax error in the database query.', 500));
                            throw err;
                        }
                    }
                    else{
                        // Increment counter for completed queries
                        queriesCompleted++;

                        if (queriesCompleted === groups.length) {
                            res.status(200).json({
                                success: true,
                                message: "Group updated successful"
                            });
                        }
                    }
                }
            )
        });
    }
    else{
        res.status(200).json({
            success: true,
            message: "Group updated successful"
        });
    }

    
});


//==================================================================
//create new group
//==================================================================
module.exports.checkGroup = catchAsyncErrors (async (req, res, next) => {
    if(!req.params.groupname){
        return next(new ErrorHandler('Missing required parameter.', 400));
    }

    const groupname = req.params.groupname;

    const query = 'SELECT groupname FROM tms_grp where groupname = ?';

    dbconnection.query(
        query,
        groupname,
        function(err, rows) {
            if (err){
                return next(new ErrorHandler('The database server is unavailable, or there is a syntax error in the database query.', 500));
                // throw err;
            }
            else{
                if(rows.length > 0){
                    res.status(200).json({
                        success: true,
                        data: {
                            groupexist: true
                        }
                    });
                }
                else{
                    res.status(200).json({
                        success: true,
                        data: {
                            groupexist: false
                        }
                    });
                }
                
            }
            
        }
    )
});


//==================================================================
//create new group
//==================================================================
module.exports.getAllGroup = catchAsyncErrors (async (req, res, next) => {
    const query = 'SELECT groupname FROM tms_grp';

    dbconnection.query(
        query,
        function(err, rows) {
            if (err){
                return next(new ErrorHandler('The database server is unavailable, or there is a syntax error in the database query.', 500));
                // throw err;
            }
            else{
                if(rows.length > 0){
                    const grouplist = [];
                    rows.forEach((value, index) => {
                        grouplist.push(value.groupname)
                    });

                    res.status(200).json({
                        success: true,
                        data: grouplist
                    });
                }
                else{
                    res.status(200).json({
                        success: true,
                        data: []
                    });
                }
                
            }
            
        }
    )
});