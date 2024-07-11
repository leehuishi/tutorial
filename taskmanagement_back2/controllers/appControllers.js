const dbconnection = require('../config/configdb');
const catchAsyncErrors = require('../middlewares/catchAsyncErrors');
const ErrorHandler = require('../utils/errorHandler');
const moment = require('moment');


function checkappname(appname){
    //alphanumeric and underscore
    //length of 4 to 32
    const regex = /^[a-zA-Z0-9_]+$/;

    if(!regex.test(appname)){
        return false;
    }
    else{
        return true;
    }
}

function checkapprnum(apprnum){
    //positive integer and non-zero
    const regex = /^[1-9]\d*$/;

    if(!regex.test(apprnum)){
        return false;
    }
    else{
        return true;
    }
}

function checkdate(dateinput) {
    return moment(dateinput, 'YYYY-MM-DD', true).isValid();
}

//==================================================================
//create new app
//==================================================================
// Query to insert new app
function insertNewApp(query, insertdata) {
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
module.exports.createApp = catchAsyncErrors (async (req, res, next) => {
    if(!req.body){
        return next(new ErrorHandler('No input', 400));
    }

    const app = req.body;

    //--------------------------------------------------------------
    //handle app name
    //--------------------------------------------------------------
    //check app name format
    const checkan = checkappname(app.appname);

    if(!checkan){
        return next(new ErrorHandler('Invalid app name format', 400));
    }
    //--------------------------------------------------------------

    //--------------------------------------------------------------
    //handle app rnum
    //--------------------------------------------------------------
    //check app rnum format
    const checkarnum = checkapprnum(app.apprnum);

    if(!checkarnum){
        return next(new ErrorHandler('Invalid app rnum format', 400));
    }
    //--------------------------------------------------------------

    //--------------------------------------------------------------
    //handle app start date
    //--------------------------------------------------------------
    //check appsdate format
    const checkasdate = checkdate(app.appsdate);

    if(!checkasdate){
        return next(new ErrorHandler('Invalid app start date format', 400));
    }
    //--------------------------------------------------------------

    //--------------------------------------------------------------
    //handle app end date
    //--------------------------------------------------------------
    //check appedate format
    const checkaedate = checkdate(app.appedate);

    if(!checkaedate){
        return next(new ErrorHandler('Invalid app end date format', 400));
    }
    //--------------------------------------------------------------
    const insertdata = [app.appname, app.appdesc, app.apprnum, app.appsdate, app.appedate];
    var pre_query1 = 'INSERT INTO app (app_acronym, app_description, app_rnumber, app_startdate, app_enddate';
    var pre_query2 = ') VALUES (?, ?, ?, ?, ?';
    var pre_query3 = ')';


    if(app.appcreate != ""){
        insertdata.push(app.appcreate);
        pre_query1 = pre_query1 + ', app_permit_create';
        pre_query2 = pre_query2 + ', ?';
    }

    if(app.appopen != ""){
        insertdata.push(app.appopen)
        pre_query1 = pre_query1 + ', app_permit_open';
        pre_query2 = pre_query2 + ', ?';
    }

    if(app.apptodo != ""){
        insertdata.push(app.apptodo)
        pre_query1 = pre_query1 + ', app_permit_todolist';
        pre_query2 = pre_query2 + ', ?';
    }

    if(app.appdoing != ""){
        insertdata.push(app.appdoing)
        pre_query1 = pre_query1 + ', app_permit_doing';
        pre_query2 = pre_query2 + ', ?';
    }

    if(app.appdone != ""){
        insertdata.push(app.appdone)
        pre_query1 = pre_query1 + ', app_permit_done';
        pre_query2 = pre_query2 + ', ?';
    }

    const query = pre_query1 + pre_query2 + pre_query3;


    try {
        const newAppRes = await insertNewApp(query, insertdata);
        
        if(newAppRes){
            res.status(200).json({
                success: true,
                message: "App created successful"
            });
        }

    } catch (err) {
        if(err.code === "ER_DUP_ENTRY"){
            return next(new ErrorHandler('App Exist. Please use another app name', 400));
        }
        else if(err.code == "ER_NO_REFERENCED_ROW_2"){
            return next(new ErrorHandler('Group selected does not exist', 400));
        }
        else{
            // throw err;
            return next(new ErrorHandler('The database server is unavailable, or there is a syntax error in the database query.', 500));
        }
    }
});


//==================================================================
//edit app
//==================================================================
// Query to update app
function UpdateApp(query, updatedata) {
    return new Promise((resolve, reject) => {
        dbconnection.query(query, updatedata, function(err, rows) {
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
module.exports.updateApp = catchAsyncErrors (async (req, res, next) => {
    if(!req.body){
        return next(new ErrorHandler('No input', 400));
    }

    const app = req.body;

    //--------------------------------------------------------------
    //handle app start date
    //--------------------------------------------------------------
    //check appsdate format
    const checkasdate = checkdate(app.appsdate);

    if(!checkasdate){
        return next(new ErrorHandler('Invalid app start date format', 400));
    }
    //--------------------------------------------------------------

    //--------------------------------------------------------------
    //handle app end date
    //--------------------------------------------------------------
    //check appedate format
    const checkaedate = checkdate(app.appedate);

    if(!checkaedate){
        return next(new ErrorHandler('Invalid app end date format', 400));
    }
    //--------------------------------------------------------------
    const updatedata = [app.appsdate, app.appedate];
    var pre_query1 = 'UPDATE app SET app_startdate = ?, app_enddate = ?';
    var pre_query2 = ' where app_acronym = ?';


    if(app.appcreate != ""){
        updatedata.push(app.appcreate);
        pre_query1 = pre_query1 + ', app_permit_create = ?';
    }
    else{
        pre_query1 = pre_query1 + ', app_permit_create = null';
    }

    if(app.appopen != ""){
        updatedata.push(app.appopen)
        pre_query1 = pre_query1 + ', app_permit_open = ?';
    }
    else{
        pre_query1 = pre_query1 + ', app_permit_open = null';
    }

    if(app.apptodo != ""){
        updatedata.push(app.apptodo)
        pre_query1 = pre_query1 + ', app_permit_todolist = ?';
    }
    else{
        pre_query1 = pre_query1 + ', app_permit_todolist = null';
    }

    if(app.appdoing != ""){
        updatedata.push(app.appdoing)
        pre_query1 = pre_query1 + ', app_permit_doing = ?';
    }
    else{
        pre_query1 = pre_query1 + ', app_permit_doing = null';
    }

    if(app.appdone != ""){
        updatedata.push(app.appdone)
        pre_query1 = pre_query1 + ', app_permit_done = ?';
    }
    else{
        pre_query1 = pre_query1 + ', app_permit_done = null';
    }

    const query = pre_query1 + pre_query2;
    updatedata.push(app.appname);


    try {
        const editAppRes = await UpdateApp(query, updatedata);
        
        if(editAppRes){
            res.status(200).json({
                success: true,
                message: "App updated successful"
            });
        }

    } catch (err) {
        if(err.code == "ER_NO_REFERENCED_ROW_2"){
            return next(new ErrorHandler('Group selected does not exist', 400));
        }
        else{
            // throw err;
            return next(new ErrorHandler('The database server is unavailable, or there is a syntax error in the database query.', 500));
        }
    }
});

//==================================================================
//check if app exist
//==================================================================
// Query to check if app name exist
function checkAppQuery(appname) {
    return new Promise((resolve, reject) => {
        const query = 'SELECT app_acronym FROM app where app_acronym = ?';
        
        dbconnection.query(query, [appname], function(err, rows) {
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

module.exports.checkApp = catchAsyncErrors (async (req, res, next) => {
    if(!req.params.appname){
        return next(new ErrorHandler('Missing required parameter.', 400));
    }

    try {
        const appnameRes = await checkAppQuery(req.params.appname);
        
        if(appnameRes){
            res.status(200).json({
                success: true,
                data: {
                    appexist: true
                }
            });
        }
        else{
            res.status(200).json({
                success: true,
                data: {
                    appexist: false
                }
            });
        }

    } catch (err) {
        return next(new ErrorHandler('The database server is unavailable, or there is a syntax error in the database query.', 500));
    }
});


//==================================================================
//retrieve all application details
//==================================================================
// Query to get all app
function allApp() {
    return new Promise((resolve, reject) => {
        const query = 'SELECT * FROM app';
        
        dbconnection.query(query, function(err, rows) {
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

module.exports.getAllApp = catchAsyncErrors (async (req, res, next) => {
    try {
        const allAppRes = await allApp();

        if(allAppRes){
            res.status(200).json({
                success: true,
                data: allAppRes
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


//==================================================================
//retrieve specific app details
//==================================================================
// Query to get all app
function getAppQuery(appname) {
    return new Promise((resolve, reject) => {
        const query = 'SELECT * FROM app where app_acronym = ?';
        
        dbconnection.query(query, appname, function(err, rows) {
            if (err) {
                reject(err); // Reject with the database query error
            } else {
                if(rows.length > 0){
                    resolve(rows[0]); //there are applications
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

module.exports.getApp = catchAsyncErrors (async (req, res, next) => {
    if(!req.params.appname){
        return next(new ErrorHandler('Missing required parameter.', 400));
    }

    try {
        const appRes = await getAppQuery(req.params.appname);

        if(appRes){
            res.status(200).json({
                success: true,
                data: appRes
            });
        }
        else{
            return next(new ErrorHandler('Invalid app', 400));
        }

    } catch (err) {
        return next(new ErrorHandler('The database server is unavailable, or there is a syntax error in the database query.', 500));
    }
});