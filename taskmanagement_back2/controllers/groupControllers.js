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
// Query to insert new group
function insertNewGroup(groupname) {
    return new Promise((resolve, reject) => {
        const query = 'INSERT INTO tms_grp VALUES (?)';
        
        dbconnection.query(query, groupname, function(err, rows) {
            if (err) {
                reject(err); // Reject with the database query error
            } else {
                //insert data successfully
                resolve(true); 
            }
        });
    });
}

//---------------------------------------------
//---------------------------------------------
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
    try {
        const newGrpRes = await insertNewGroup(req.body.groupname);
        
        if(newGrpRes){
            res.status(200).json({
                success: true,
                message: "Group created successful"
            });
        }

    } catch (err) {
        if(err.code === "ER_DUP_ENTRY"){
            return next(new ErrorHandler('Group Exist. Please use another group name', 500));
        }
        else{
            return next(new ErrorHandler('The database server is unavailable, or there is a syntax error in the database query.', 500));
        }
    }
});


//==================================================================
//Update group by username
//==================================================================
// Query to get the list of group pair not in list
function notInGrpList(groupslist, username) {
    return new Promise((resolve, reject) => {
        const query = 'SELECT groupname FROM tms_usergroups where username = ? and groupname not in ('+ groupslist +')';
        
        dbconnection.query(query, [username], function(err, rows) {
            if (err) {
                reject(err); // Reject with the database query error
            } else {
                resolve(rows); //return the list
            }
        });
    });
}
//---------------------------------------------
// Query to remove user from group
function removeUserGrpList(username, groupname) {
    return new Promise((resolve, reject) => {
        const query = 'DELETE FROM tms_usergroups WHERE username = ? and groupname = ?';
        
        dbconnection.query(query, [username, groupname], function(err, rows) {
            if (err) {
                reject(err); // Reject with the database query error
            } else {
                resolve(true); //removed from grp successfully
            }
        });
    });
}

//---------------------------------------------
// Query to add user into group
function addUserGrpList(username, groupname) {
    return new Promise((resolve, reject) => {
        const query = 'insert into tms_usergroups (username, groupname) value (? , ?)';
        
        dbconnection.query(query, [username, groupname], function(err, rows) {
            if (err) {
                reject(err); // Reject with the database query error
            } else {
                resolve(true); //removed from grp successfully
            }
        });
    });
}
//---------------------------------------------
//---------------------------------------------

module.exports.updateGroupByUsername = catchAsyncErrors (async (req, res, next) => {
    if(!req.params.username){
        return next(new ErrorHandler('Missing required parameter.', 400));
    }

    if(!req.body.groups){
        return next(new ErrorHandler('Missing required parameter.', 400));
    }

    const groups = req.body.groups;
    const groupslist = '"' + groups.join('", "') + '"';

    //--------------------------------------------------------
    //check and remove pairs if user has been removed from the group
    try {
        const notInGrpRes = await notInGrpList(groupslist, req.params.username);
        
        if(notInGrpRes){
            if(notInGrpRes.length > 0){
                //remove pairs 
                const removePairPromises = notInGrpRes.map(catchAsyncErrors(async (pairRow) => {
                    await removeUserGrpList(req.params.username, pairRow.groupname);
                }));
    
                // Wait for all promises to resolve using Promise.all
                await Promise.all(removePairPromises);
            }
        }
        else{
            return next(new ErrorHandler('The database server is unavailable, or there is a syntax error in the database query.', 500));
        }

    } catch (err) {
        return next(new ErrorHandler('The database server is unavailable, or there is a syntax error in the database query.', 500));
    }
    
    //--------------------------------------------------------
    //start to add users into groups
    try {
        if(groups.length > 0){
            const addPairPromises = groups.map(catchAsyncErrors(async (group) => {
                try{
                    await addUserGrpList(req.params.username, group);
                }
                catch (err) {
                    if (err.code === "ER_NO_REFERENCED_ROW_2"){
                        return next(new ErrorHandler('Invalid group provided', 400));
                    }
                    else if (err.code === "ER_DUP_ENTRY"){
                        return;
                    }
                    else{
                        return next(new ErrorHandler('The database server is unavailable, or there is a syntax error in the database query.', 500));
                        // throw err;
                    }
                }
            }));

            // Wait for all promises to resolve using Promise.all
            await Promise.all(addPairPromises);

            res.status(200).json({
                success: true,
                message: "Group updated successful"
            });
        }
        else{
            res.status(200).json({
                success: true,
                message: "Group updated successful"
            });
        }
    }
    catch (err) {
        return next(new ErrorHandler('The database server is unavailable, or there is a syntax error in the database query.', 500));
    }
});


//==================================================================
//check if group exist
//==================================================================
// Query to check if groupname exist
function checkGroupname(groupname) {
    return new Promise((resolve, reject) => {
        const query = 'SELECT groupname FROM tms_grp where groupname = ?';
        
        dbconnection.query(query, [groupname], function(err, rows) {
            if (err) {
                reject(err); // Reject with the database query error
            } else {
                if(rows.length > 0){
                    resolve(true); //groupname exist
                }
                else{
                    resolve(false); //groupname doesn't exist
                }
            }
        });
    });
}

//---------------------------------------------
//---------------------------------------------

module.exports.checkGroup = catchAsyncErrors (async (req, res, next) => {
    if(!req.params.groupname){
        return next(new ErrorHandler('Missing required parameter.', 400));
    }

    try {
        const groupnameRes = await checkGroupname(req.params.groupname);
        
        if(groupnameRes){
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

    } catch (err) {
        return next(new ErrorHandler('The database server is unavailable, or there is a syntax error in the database query.', 500));
    }
});


//==================================================================
//retrieve all groups
//==================================================================
// Query to get all groupname
function allGroupname() {
    return new Promise((resolve, reject) => {
        const query = 'SELECT groupname FROM tms_grp';
        
        dbconnection.query(query, function(err, rows) {
            if (err) {
                reject(err); // Reject with the database query error
            } else {
                if(rows.length > 0){
                    resolve(rows); //there are groups
                }
                else{
                    resolve(false); //there are no groups
                }
            }
        });
    });
}
//---------------------------------------------
//---------------------------------------------

module.exports.getAllGroup = catchAsyncErrors (async (req, res, next) => {
    try {
        const allGroupRes = await allGroupname();
        
        // Array to hold all users with their groups
        const grouplist = [];

        if(allGroupRes){
            const groupPromises = allGroupRes.map(catchAsyncErrors(async (groupRow) => {
                grouplist.push(groupRow.groupname)
            }));

            // Wait for all promises to resolve using Promise.all
            await Promise.all(groupPromises);

            res.status(200).json({
                success: true,
                data: grouplist
            });
        }
        else{
            // Send response with empty users array
            res.status(200).json({
                success: true,
                data: []
            });
        }

    } catch (err) {
        return next(new ErrorHandler('The database server is unavailable, or there is a syntax error in the database query.', 500));
    }
});