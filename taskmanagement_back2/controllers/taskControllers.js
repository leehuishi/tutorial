const dbconnection = require('../config/configdb');
const catchAsyncErrors = require('../middlewares/catchAsyncErrors');
const ErrorHandler = require('../utils/errorHandler');
const { Checkgroup } = require('../middlewares/auth');
const nodemailer = require('nodemailer');

function getCurrentDateTimeFormatted() {
    const currentDate = new Date();
    
    // Get date components
    const year = currentDate.getFullYear();
    const month = ('0' + (currentDate.getMonth() + 1)).slice(-2); // Adding 1 because getMonth() returns zero-based index
    const day = ('0' + currentDate.getDate()).slice(-2);
    
    // Get time components
    const hours = ('0' + currentDate.getHours()).slice(-2);
    const minutes = ('0' + currentDate.getMinutes()).slice(-2);
    
    // Format the date and time string
    const formattedDateTime = `${year}-${month}-${day}, ${hours}${minutes}H`;

    return formattedDateTime;
}

//==================================================================
//Check if user is in the grp that has permit
//==================================================================

// Query to select group with permission
function checkGrpWithPerm(appid, type) {
    const query = 'SELECT ?? FROM app WHERE app_acronym = ?';

    return new Promise((resolve, reject) => {
        dbconnection.query(query, [type, appid], function(err, rows) {
            if (err) {
                reject(err); // Reject with the database query error
            } else {
                //insert data successfully
                if(rows.length > 0){
                    resolve(rows[0][type]);
                }
                else{
                    resolve(false);
                } 
            }
        });
    });
}

async function checkGrp (username, appid, type) {
    try {
        const grp_with_permit = await checkGrpWithPerm(appid, type);
        
        
        if(grp_with_permit){
            const result = await Checkgroup(username, grp_with_permit);
            return result; // Return the result directly
        }
        else{
            return false;
        }
            

    } catch (err) {
        return false;
    }
}




//==================================================================
//create new task
//==================================================================
// Query to retrieve latest rnum
function getAppRNum(appid) {
    const query = 'SELECT app_rnumber from app where app_acronym = ?';

    return new Promise((resolve, reject) => {
        dbconnection.query(query, [appid], function(err, rows) {
            if (err) {
                reject(err); // Reject with the database query error
            } else {
                if(rows.length > 0){
                    resolve(rows[0].app_rnumber); //return rnum
                }
                else{
                    resolve(false);
                }
            }
        });
    });
}

// Query to insert new task
function insertNewTask(insertdata) {
    const query = 'INSERT INTO task (task_name, task_description, task_plan, task_app_acronym, task_state, task_creator, task_owner, task_notes, task_id, task_createdate) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';

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

// Query to update app running num
function updateAppRnum(appid, new_rnum) {
    const query = 'UPDATE app SET app_rnumber = ? WHERE app_acronym = ?';

    return new Promise((resolve, reject) => {
        dbconnection.query(query, [new_rnum, appid], function(err, rows) {
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
module.exports.createTask = catchAsyncErrors (async (req, res, next) => {
    
    if(!req.body){
        return next(new ErrorHandler('No input', 400));
    }

    const task = req.body;

    const checkGrp2 = await checkGrp(req.user.username, task.task_app_acronym, 'app_permit_create');
    

    if(!checkGrp2){
        return next(new ErrorHandler(`User is not allowed to access this resource.`, 403));
    }

    const insertdata = [task.task_name, task.task_desc, task.task_plan, task.task_app_acronym, 'open', req.user.username, req.user.username];

    //--------------------------------------------------------------
    //handle task_notes
    //--------------------------------------------------------------
    const msg = "[" + getCurrentDateTimeFormatted() + ", Create], " + req.user.username + " has created task.\n#########################################\n";
    insertdata.push(msg);
    //--------------------------------------------------------------

    //--------------------------------------------------------------
    //handle new task id
    //--------------------------------------------------------------
    //retrieve app_rnumber
    try {
        const new_rnum = await getAppRNum(task.task_app_acronym);
        if(new_rnum){
            const new_rnum2 = new_rnum + 1;
            const new_taskid = task.task_app_acronym + "_" + new_rnum2;
            insertdata.push(new_taskid);
        }
        else{
            return next(new ErrorHandler('App does not exist', 400));
        }
        

    } catch (err) {
        return next(new ErrorHandler('The database server is unavailable, or there is a syntax error in the database query.', 500));
    }
    
    //--------------------------------------------------------------

    //--------------------------------------------------------------
    //handle task created date
    //--------------------------------------------------------------
    const currentDate = new Date().toISOString().slice(0, 10); // Get current date in 'YYYY-MM-DD' format
    insertdata.push(currentDate);
    //--------------------------------------------------------------

    try {
        const newTaskRes = await insertNewTask(insertdata);
        
        if(newTaskRes){
            const new_rnum = await getAppRNum(task.task_app_acronym);

            if(new_rnum){
                const new_rnum2 = new_rnum + 1;
                const updateAppRnumRes = await updateAppRnum(task.task_app_acronym, new_rnum2);

                if(updateAppRnumRes){
                    res.status(200).json({
                        success: true,
                        message: "Task created successful",
                        data: {
                            "task_plan": insertdata[2],
                            "task_id": insertdata[8],
                            "task_name": insertdata[0],
                            "task_description": insertdata[1],
                            "task_owner": insertdata[6],
                            "task_state": insertdata[4],
                        }
                    });
                }
                else{
                    return next(new ErrorHandler('Error in updating app running number', 500));
                }
            }
            else{
                return next(new ErrorHandler('App does not exist', 400));
            }
        }

    } catch (err) {
        if(err.code == "ER_NO_REFERENCED_ROW_2"){
            return next(new ErrorHandler('App does not exist', 400));
        }
        else{
            throw err;
            // return next(new ErrorHandler('The database server is unavailable, or there is a syntax error in the database query.', 500));
        }
    }
});


//==================================================================
//edit task plan
//==================================================================
// Query to update app
function UpdateApp(task, taskplan) {
    const query = 'UPDATE task SET task_plan = ? where task_id = ?';

    return new Promise((resolve, reject) => {
        dbconnection.query(query, [taskplan, task], function(err, rows) {
            if (err) {
                reject(err); // Reject with the database query error
            } else {
                //insert data successfully
                resolve(true); 
            }
        });
    });
}


// Query to get appid with task_id
function GetAppID(taskid) {
    const query = 'SELECT task_app_acronym FROM task WHERE task_id = ?';

    return new Promise((resolve, reject) => {
        dbconnection.query(query, [taskid], function(err, rows) {
            if (err) {
                reject(err); // Reject with the database query error
            } else {
                if(rows.length > 0){
                    resolve(rows[0].task_app_acronym);
                }
                else{
                    resolve(false);
                }
            }
        });
    });
}

//---------------------------------------------
//---------------------------------------------

//---------------------------------------------
//---------------------------------------------
module.exports.updateTaskPlan = catchAsyncErrors (async (req, res, next) => {
    if(!req.body){
        return next(new ErrorHandler('No input', 400));
    }

    const task = req.body;
    var permit_grp = 'app_permit_open';

    if(task.task_state === 'open'){
        permit_grp = 'app_permit_open'
    }
    else{
        permit_grp = 'app_permit_done'
    }

    const appid = await GetAppID(task.task_id);
    const checkGrp2 = await checkGrp(req.user.username, appid, permit_grp);

    if(!checkGrp2){
        return next(new ErrorHandler(`User is not allowed to access this resource.`, 403));
    }

    //--------------------------------------------------------------
    //handle task_id
    //--------------------------------------------------------------
    if(!task.task_id){
        return next(new ErrorHandler('Missing task id', 400));
    }
    //--------------------------------------------------------------

    //--------------------------------------------------------------
    //handle task_plan
    //--------------------------------------------------------------
    if(!task.task_plan){
        task_plan = "";
    }
    else{
        task_plan = task.task_plan
    }
    //--------------------------------------------------------------

    try {
        const editTaskRes = await UpdateApp(task.task_id, task_plan);
        
        if(editTaskRes){
            res.status(200).json({
                success: true,
                message: "Task updated successful"
            });
        }

    } catch (err) {
        if(err.code == "ER_NO_REFERENCED_ROW_2"){
            return next(new ErrorHandler('Plan selected does not exist', 400));
        }
        else{
            // throw err;
            return next(new ErrorHandler('The database server is unavailable, or there is a syntax error in the database query.', 500));
        }
    }
});


//==================================================================
//retrieve all task details
//==================================================================
// Query to get all task under app
function allTask(appname) {
    return new Promise((resolve, reject) => {
        const query = 'SELECT task_plan, task_id, task_name, task_description, task_owner, task_state FROM task WHERE task_app_acronym = ?';
        
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

module.exports.getAllTask = catchAsyncErrors (async (req, res, next) => {
    try {
        if(!req.params.appname){
            return next(new ErrorHandler('Missing required parameter.', 400));
        }

        const allTaskRes = await allTask(req.params.appname);

        if(allTaskRes){
            res.status(200).json({
                success: true,
                data: allTaskRes
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
//retrieve all task notes
//==================================================================
// Query to get task notes
function allTaskNotes(taskid) {
    return new Promise((resolve, reject) => {
        const query = 'SELECT task_notes FROM task WHERE task_id = ?';
        
        dbconnection.query(query, [taskid], function(err, rows) {
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

module.exports.getTaskNotes = catchAsyncErrors (async (req, res, next) => {
    try {
        if(!req.params.taskid){
            return next(new ErrorHandler('Missing required parameter.', 400));
        }

        const allTaskNotesRes = await allTaskNotes(req.params.taskid);

        if(allTaskNotesRes){
            res.status(200).json({
                success: true,
                data: allTaskNotesRes
            });
        }
        else{
            // Send response with empty users array
            res.status(200).json({
                success: true,
                data: ""
            });
        }

    } catch (err) {
        return next(new ErrorHandler('The database server is unavailable, or there is a syntax error in the database query.', 500));
    }
});


//==================================================================
//add notes in tasks
//==================================================================

//---------------------------------------------
//---------------------------------------------
// Query to update note
function UpdateNote(taskid, notes, username) {
    const query = 'UPDATE task SET task_notes = ?, task_owner = ? where task_id = ?';

    return new Promise((resolve, reject) => {
        dbconnection.query(query, [notes, username, taskid], function(err, rows) {
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


//---------------------------------------------
//---------------------------------------------

module.exports.addTaskNotes = catchAsyncErrors (async (req, res, next) => {
    try {
        if(!req.params.taskid){
            return next(new ErrorHandler('Missing required parameter.', 400));
        }

        if(!req.body){
            return next(new ErrorHandler('No input', 400));
        }

        const note = req.body;
        var permit_grp = 'app_permit_open'; 


        if(note.state === "open"){
            permit_grp = 'app_permit_open';
        }
        else if(note.state === "todo"){
            permit_grp = 'app_permit_todolist';
        }
        else if(note.state === "doing"){
            permit_grp = 'app_permit_doing';
        
        }
        else if(note.state === "done"){
            permit_grp = 'app_permit_done';
        }

        const appid = await GetAppID(req.params.taskid);
        const checkGrp2 = await checkGrp(req.user.username, appid, permit_grp);

        if(!checkGrp2){
            return next(new ErrorHandler(`User is not allowed to access this resource.`, 403));
        }
        

        const allTaskNotesRes = await allTaskNotes(req.params.taskid);

        if(allTaskNotesRes.task_notes){
            if(note.state && note.notes){
                const state = note.state.charAt(0).toUpperCase() + note.state.slice(1);
                const msg = "[" + getCurrentDateTimeFormatted() + ", " + state + "], " + req.user.username + " added note:" + note.notes + " \n#########################################\n";
                const new_notes = msg + allTaskNotesRes.task_notes;

                const addNotesRes = await UpdateNote(req.params.taskid, new_notes, req.user.username);

                if(addNotesRes){
                    res.status(200).json({
                        success: true,
                        message: "Task updated successful",
                        data: new_notes,
                        newowner: req.user.username
                    });
                }
                
            }
            else{
                return next(new ErrorHandler('Missing input.', 400));
            }
            
        }
        else{
            return next(new ErrorHandler('The database server is unavailable, or there is a syntax error in the database query.', 500));
        }

    } catch (err) {
        return next(new ErrorHandler('The database server is unavailable, or there is a syntax error in the database query.', 500));
    }
});

//==================================================================
//Update status in task
//==================================================================
function getEmaillist(grouplist) {
    const query = 'select email from tms_users where username in (select username from tms_usergroups where groupname = ?)';

    return new Promise((resolve, reject) => {
        dbconnection.query(query, [grouplist], function(err, rows) {
            if (err) {
                reject(err); // Reject with the database query error
            } else {
                var emaillist = [];
                rows.forEach((row) => {
                    emaillist.push(row.email)
                })
                resolve(emaillist); 
            }
        });
    });
}

function getTask(task_id) {
    const query = 'select task_owner, task_name from task where task_id = ?';

    return new Promise((resolve, reject) => {
        dbconnection.query(query, [task_id], function(err, rows) {
            if (err) {
                reject(err); // Reject with the database query error
            } else {
                resolve(rows[0]); 
            }
        });
    });
}

const transporter = nodemailer.createTransport({
    service: 'outlook',
    auth:{
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

async function sendTaskDoneNotification(grouplist, task_id){
    try {
        // Retrieve email list based on group list
        const emaillist = await getEmaillist(grouplist);

        // Retrieve task details based on task_id
        const task = await getTask(task_id);
        const taskOwner = task.task_owner;
        const taskName = task.task_name;
    
        // Prepare email options
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: emaillist.join(','),
            subject: `Task Completed: ${taskName}`,
            text: `Task ${taskName} has been completed by ${taskOwner} and is pending your action.`
        };

        await transporter.sendMail(mailOptions);
        console.log('Email sent successfully');
    }
    catch(err){
        console.error('Failed to send email:', err)
    }
    
}

// Query to update note
function UpdateState(taskid, state, notes, username) {
    const query = 'UPDATE task SET task_state = ?, task_notes = ?, task_owner = ? where task_id = ?';

    return new Promise((resolve, reject) => {
        dbconnection.query(query, [state, notes, username, taskid], function(err, rows) {
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

module.exports.updateTaskState = catchAsyncErrors (async (req, res, next) => {
    try {
        if(!req.body){
            return next(new ErrorHandler('No input', 400));
        }
        
        const task = req.body;
        var newstate = "open";
        var dispstate = "Open";
        var dispaction = "Open";
        var permit_grp = 'app_permit_open'; 
        const appid = await GetAppID(task.task_id); 

        if(task.task_state && task.task_id){
            if(task.task_state === "open"){
                permit_grp = 'app_permit_open';
                newstate = "todo";
                dispstate = "Open";
                dispaction = "release";
            }
            else if(task.task_state === "todo"){
                permit_grp = 'app_permit_todolist';
                newstate = "doing";
                dispstate = "Todo"
                dispaction = "acknowledge";
            }
            else if(task.task_state === "doing"){
                permit_grp = 'app_permit_doing';
                newstate = "done";
                dispstate = "Doing"
                dispaction = "complete";
            }
            else if(task.task_state === "done"){
                permit_grp = 'app_permit_done';
                newstate = "closed";
                dispstate = "Done";
                dispaction = "approve";
            }

            const checkGrp2 = await checkGrp(req.user.username, appid, permit_grp);

            if(!checkGrp2){
                return next(new ErrorHandler(`User is not allowed to access this resource.`, 403));
            }
            
            const allTaskNotesRes = await allTaskNotes(task.task_id);
            var new_notes = ""

            if(allTaskNotesRes.task_notes){
                
                const msg = "[" + getCurrentDateTimeFormatted() + ", " + dispstate + "], " + req.user.username + " has " + dispaction + " the task. \n#########################################\n";
                new_notes = msg + allTaskNotesRes.task_notes;         
            }

            const upgradeStateRes = await UpdateState(task.task_id, newstate,new_notes, req.user.username);

            if(task.task_state === "doing"){
                //need to make sure that send email!!!!!!!
                const grouplist = await checkGrpWithPerm(appid, 'app_permit_done');
                sendTaskDoneNotification(grouplist, task.task_id)
            }

            if(upgradeStateRes){
                res.status(200).json({
                    success: true,
                    message: "Task updated successful"
                });
            }
            
        }
        else{
            return next(new ErrorHandler('Missing input.', 400));
        }

    } catch (err) {
        throw err;
        return next(new ErrorHandler('The database server is unavailable, or there is a syntax error in the database query.', 500));
    }
});


//==================================================================
//Update status in task (down reverse)
//==================================================================
module.exports.updateTaskStateDown = catchAsyncErrors (async (req, res, next) => {
    try {
        if(!req.body){
            return next(new ErrorHandler('No input', 400));
        }
        
        const task = req.body;
        var newstate = "todo";
        var dispstate = "Doing";
        var dispaction = "halt";
        var permit_grp = 'app_permit_doing';  

        if(task.task_state && task.task_id){
            if(task.task_state === "doing"){
                permit_grp = 'app_permit_doing';
                newstate = "todo";
                dispstate = "Doing";
                dispaction = "halt";
            }
            else if(task.task_state === "done"){
                permit_grp = 'app_permit_done';
                newstate = "doing";
                dispstate = "Done";
                dispaction = "reject";
            }

            const appid = await GetAppID(task.task_id);

            const checkGrp2 = await checkGrp(req.user.username, appid, permit_grp);

            if(!checkGrp2){
                return next(new ErrorHandler(`User is not allowed to access this resource.`, 403));
            }
            
            const allTaskNotesRes = await allTaskNotes(task.task_id);
            var new_notes = ""

            if(allTaskNotesRes.task_notes){
                
                const msg = "[" + getCurrentDateTimeFormatted() + ", " + dispstate + "], " + req.user.username + " has " + dispaction + " the task. \n#########################################\n";
                new_notes = msg + allTaskNotesRes.task_notes;         
            }
            
            const downgradeStateRes = await UpdateState(task.task_id, newstate, new_notes, req.user.username);

            if(downgradeStateRes){
                res.status(200).json({
                    success: true,
                    message: "Task updated successful"
                });
            }
            
        }
        else{
            return next(new ErrorHandler('Missing input.', 400));
        }

    } catch (err) {
        throw err;
        return next(new ErrorHandler('The database server is unavailable, or there is a syntax error in the database query.', 500));
    }
});