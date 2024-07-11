const dbconnection = require('../config/configdb');
const catchAsyncErrors = require('../middlewares/catchAsyncErrors');
const ErrorHandler = require('../utils/errorHandler');
const moment = require('moment');

function checkdate(dateinput) {
    return moment(dateinput, 'YYYY-MM-DD', true).isValid();
}

//==================================================================
//create new app
//==================================================================
// Query to insert new plan
function insertNewPlan(insertdata) {
    const query = 'INSERT INTO plan (plan_mvp_name, plan_startdate, plan_endDate, plan_app_acronym) VALUES (?, ?, ?, ?)';

    return new Promise((resolve, reject) => {
        dbconnection.query(query, insertdata, function(err, rows) {
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
module.exports.createPlan = catchAsyncErrors (async (req, res, next) => {
    if(!req.body){
        return next(new ErrorHandler('No input', 400));
    }

    if(!req.params.appname){
        return next(new ErrorHandler('Missing required parameter.', 400));
    }

    const plan = req.body;

    //--------------------------------------------------------------
    //handle plan start date
    //--------------------------------------------------------------
    //check planstartdate format
    const checkpsdate = checkdate(plan.planstartdate);

    if(!checkpsdate){
        return next(new ErrorHandler('Invalid plan start date format', 400));
    }
    //--------------------------------------------------------------

    //--------------------------------------------------------------
    //handle plan end date
    //--------------------------------------------------------------
    //check planenddate format
    const checkpedate = checkdate(plan.planenddate);

    if(!checkpedate){
        return next(new ErrorHandler('Invalid plan end date format', 400));
    }
    //--------------------------------------------------------------


    const insertdata = [plan.planname, plan.planstartdate, plan.planenddate, req.params.appname];


    try {
        const newPlanRes = await insertNewPlan(insertdata);
        
        if(newPlanRes){
            res.status(200).json({
                success: true,
                message: "Plan created successful"
            });
        }

    } catch (err) {
        if(err.code === "ER_DUP_ENTRY"){
            return next(new ErrorHandler('Plan Exist. Please use another plan name', 400));
        }
        else if(err.code == "ER_NO_REFERENCED_ROW_2"){
            return next(new ErrorHandler('App does not exist', 400));
        }
        else{
            // throw err;
            return next(new ErrorHandler('The database server is unavailable, or there is a syntax error in the database query.', 500));
        }
    }
});

//==================================================================
//check if plan exist
//==================================================================
// Query to check if plan name exist
function checkPlanQuery(planname, appname) {
    return new Promise((resolve, reject) => {
        const query = 'SELECT plan_mvp_name FROM plan where plan_mvp_name = ? and plan_app_acronym = ?';
        
        dbconnection.query(query, [planname, appname], function(err, rows) {
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

module.exports.checkPlan = catchAsyncErrors (async (req, res, next) => {
    if(!req.query.planname){
        return next(new ErrorHandler('Missing plan name.', 400));
    }

    if(!req.query.appname){
        return next(new ErrorHandler('Missing app name.', 400));
    }

    try {
        const plannameRes = await checkPlanQuery(req.query.planname, req.query.appname);
        
        if(plannameRes){
            res.status(200).json({
                success: true,
                data: {
                    planexist: true
                }
            });
        }
        else{
            res.status(200).json({
                success: true,
                data: {
                    planexist: false
                }
            });
        }

    } catch (err) {
        return next(new ErrorHandler('The database server is unavailable, or there is a syntax error in the database query.', 500));
    }
});


//==================================================================
//retrieve all plan details
//==================================================================
// Query to get all plan under app
function allPlan(appname) {
    return new Promise((resolve, reject) => {
        const query = 'SELECT plan_mvp_name as planname, plan_startdate as planstartdate, plan_endDate as planenddate FROM plan WHERE plan_app_acronym = ?';
        
        dbconnection.query(query, [appname], function(err, rows) {
            if (err) {
                reject(err); // Reject with the database query error
            } else {
                if(rows.length > 0){
                    resolve(rows); //there are applications
                }
                else{
                    resolve(false); //there are no applications
                }
            }
        });
    });
}
//---------------------------------------------
//---------------------------------------------

module.exports.getAllPlan = catchAsyncErrors (async (req, res, next) => {
    try {
        if(!req.params.appname){
            return next(new ErrorHandler('Missing required parameter.', 400));
        }

        const allPlanRes = await allPlan(req.params.appname);

        if(allPlanRes){
            res.status(200).json({
                success: true,
                data: allPlanRes
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