const dbconnection = require('../config/configdb');
const catchAsyncErrors = require('../middlewares/catchAsyncErrors');
const ErrorHandler = require('../utils/errorHandler');
const nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs');

//==================================================================
//Get current date and time
//==================================================================
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
//==================================================================

//==================================================================
//Get Permitted Group by state and app_acronym
//==================================================================
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
//==================================================================
//==================================================================


//==================================================================
//Check if user is in permitted group
//==================================================================
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
//==================================================================


//==================================================================
//==================================================================
//==================================================================
//==================================================================




//==================================================================
//create new task
//==================================================================
module.exports.createTask = catchAsyncErrors (async (req, res, next) => {
    const client = await dbconnection.promise().getConnection();

    try{
        await client.query('START TRANSACTION');

        //--------------------------------------------------------------
        //payload check
        //--------------------------------------------------------------
        //all field must be string

        if(!req.body){
            return next(new ErrorHandler('P400', 400));
        }

        const task = req.body;

        if(!task.username || task.username ===""){
            return next(new ErrorHandler('P400', 400));
        }
        else if(typeof task.username !== "string"){
            return next(new ErrorHandler('P400', 400));
        }
        else{
            var username = task.username;
        }
        
        //================================================================
        if(!task.password || task.password ===""){
            return next(new ErrorHandler('P400', 400));
        }
        else if(typeof task.password !== "string"){
            return next(new ErrorHandler('P400', 400));
        }
        else{
            var password = task.password;
        }

        //================================================================
        if(!task.Task_app_Acronym || task.Task_app_Acronym ===""){
            return next(new ErrorHandler('P400', 400));
        }
        else if(typeof task.Task_app_Acronym !== "string"){
            return next(new ErrorHandler('P400', 400));
        }
        else{
            var Task_app_Acronym = task.Task_app_Acronym;

            //Task_app_Acronym must exist in app table
            const check_appacronym_query = 'SELECT app_acronym from app where app_acronym = ?';
            const [rows] = await client.query(check_appacronym_query, [Task_app_Acronym]);
            if(rows.length < 1){
                return next(new ErrorHandler('P400', 400));
            }
        }

        //================================================================
        if(!task.Task_Name || task.Task_Name ===""){
            return next(new ErrorHandler('P400', 400));
        }
        else if(typeof task.Task_Name !== "string"){
            return next(new ErrorHandler('P400', 400));
        }
        else{
            var Task_Name = task.Task_Name;
        }

        //================================================================
        if(task.Task_description){
            if(typeof task.Task_description !== "string"){
                return next(new ErrorHandler('P400', 400));
            }

            var Task_description = task.Task_description;
        }
        else{
            var Task_description = "";
        }

        //================================================================
        if(task.Task_plan){
            if(typeof task.Task_plan !== "string"){
                return next(new ErrorHandler('P400', 400));
            }

            var Task_plan = task.Task_plan;

            // Task_plan must exist in plan table in database
            const check_taskplan_query = 'SELECT plan_mvp_name from plan where plan_mvp_name = ? and plan_app_acronym = ?';
            const [rows2] = await client.query(check_taskplan_query, [Task_plan, Task_app_Acronym]);
            if(rows2.length < 1){
                return next(new ErrorHandler('P400', 400));
            }
        }
        else{
            var Task_plan = null;
        }

        //--------------------------------------------------------------
        //--------------------------------------------------------------


        //--------------------------------------------------------------
        //authenticate
        //--------------------------------------------------------------
        //make sure that username are valid 
        const check_crediential_query = 'SELECT password, status FROM tms_users WHERE username = ?';
        const [user_details] = await client.query(check_crediential_query, [username]);
        if(user_details.length < 1){
            return next(new ErrorHandler('A401', 401));
        }

        //make sure that password are valid
        const raw_password = user_details[0].password;
        const isPasswordMatched = await bcrypt.compare(password, raw_password);

        if (!isPasswordMatched) {
            return next(new ErrorHandler('A401', 401));
        }

        //make sure that user is not disable
        const raw_status = user_details[0].status;
        if (raw_status === 0) {
            return next(new ErrorHandler('A401', 401));
        }
        //--------------------------------------------------------------
        //--------------------------------------------------------------


        //--------------------------------------------------------------
        //access rights
        //--------------------------------------------------------------
        const checkGrp2 = await checkGrp(username, Task_app_Acronym, 'app_permit_create');

        if(!checkGrp2){
            return next(new ErrorHandler(`AR403`, 403));
        }
        //--------------------------------------------------------------
        //--------------------------------------------------------------

        //--------------------------------------------------------------
        //data output
        //--------------------------------------------------------------
        const insertdata = [Task_Name, Task_description, Task_plan, Task_app_Acronym, 'open', username, username];
    
        //--------------------------------------------------------------
        //handle task_notes
        //--------------------------------------------------------------
        const msg = "[" + getCurrentDateTimeFormatted() + ", Create], " + username + " has created task.\n#########################################\n";
        insertdata.push(msg);
        //--------------------------------------------------------------
    
        //--------------------------------------------------------------
        //handle new task id
        //--------------------------------------------------------------
        //retrieve app_rnumber
        const getAppRNumquery = 'SELECT app_rnumber from app where app_acronym = ?';
        const [row3] = await client.query(getAppRNumquery, [Task_app_Acronym]);
        if(row3.length > 0){
            var new_rnum = row3[0].app_rnumber;
        }
        else{
            var new_rnum = false;
        }

        if(new_rnum){
            const new_rnum2 = new_rnum + 1;
            const new_taskid = Task_app_Acronym + "_" + new_rnum2;
            insertdata.push(new_taskid);
        }
        //--------------------------------------------------------------
    
        //--------------------------------------------------------------
        //handle task created date
        //--------------------------------------------------------------
        const currentDate = new Date().toISOString().slice(0, 10); // Get current date in 'YYYY-MM-DD' format
        insertdata.push(currentDate);
        //--------------------------------------------------------------
    

        //--------------------------------------------------------------
        //start inserting new task
        //--------------------------------------------------------------
        const newTaskquery = 'INSERT INTO task (task_name, task_description, task_plan, task_app_acronym, task_state, task_creator, task_owner, task_notes, task_id, task_createdate) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
        const newTaskRes = await client.query(newTaskquery, insertdata);
        
        
        if(newTaskRes){
            const getAppRNumquery = 'SELECT app_rnumber from app where app_acronym = ?';
            const [row4] = await client.query(getAppRNumquery, [Task_app_Acronym]);
            if(row4.length > 0){
                var new_rnum = row4[0].app_rnumber;
            }
            else{
                var new_rnum = false;
            }

            if(new_rnum){
                const new_rnum2 = new_rnum + 1;

                const updateAppRnumquery = 'UPDATE app SET app_rnumber = ? WHERE app_acronym = ?';
                const updateAppRnumRes = await client.query(updateAppRnumquery, [new_rnum2, Task_app_Acronym]);


                if(updateAppRnumRes){
                    await client.query('COMMIT');

                    res.status(200).json({
                        Task_id: insertdata[8]
                    });
                }
            }
        }

        //--------------------------------------------------------------
    }
    catch(err){
        await client.query('ROLLBACK');

        return next(new ErrorHandler('DO500', 500));
    }
    finally {
        client.release(); // Release the client back to the pool
    }
});



//==================================================================
//retrieve all task details
//==================================================================
module.exports.getAllStateTask = catchAsyncErrors (async (req, res, next) => {
    const client = await dbconnection.promise().getConnection();

    try {
        await client.query('START TRANSACTION');

        //--------------------------------------------------------------
        //payload check
        //--------------------------------------------------------------
        //all field must be string

        if(!req.body){
            return next(new ErrorHandler('P400', 400));
        }

        const statebody = req.body;

        if(!statebody.username || statebody.username ===""){
            return next(new ErrorHandler('P400', 400));
        }
        else if(typeof statebody.username !== "string"){
            return next(new ErrorHandler('P400', 400));
        }
        else{
            var username = statebody.username;
        }
        
        //================================================================
        if(!statebody.password || statebody.password ===""){
            return next(new ErrorHandler('P400', 400));
        }
        else if(typeof statebody.password !== "string"){
            return next(new ErrorHandler('P400', 400));
        }
        else{
            var password = statebody.password;
        }

        //================================================================
        if(!statebody.Task_state || statebody.Task_state ===""){
            return next(new ErrorHandler('P400', 400));
        }
        else if(typeof statebody.Task_state !== "string"){
            return next(new ErrorHandler('P400', 400));
        }
        else{
            var Task_state = statebody.Task_state;
        }

        const task_statelist = ["open", "todo", "doing", "done", "closed"];
        if(!task_statelist.includes(Task_state)){
            return next(new ErrorHandler('P400', 400));
        }
        //--------------------------------------------------------------
        //--------------------------------------------------------------

        //--------------------------------------------------------------
        //authenticate
        //--------------------------------------------------------------
        //make sure that username are valid 
        const check_crediential_query = 'SELECT password, status FROM tms_users WHERE username = ?';
        const [user_details] = await client.query(check_crediential_query, [username]);
        if(user_details.length < 1){
            return next(new ErrorHandler('A401', 401));
        }

        //make sure that password are valid
        const raw_password = user_details[0].password;
        const isPasswordMatched = await bcrypt.compare(password, raw_password);

        if (!isPasswordMatched) {
            return next(new ErrorHandler('A401', 401));
        }

        //make sure that user is not disable
        const raw_status = user_details[0].status;
        if (raw_status === 0) {
            return next(new ErrorHandler('A401', 401));
        }
        //--------------------------------------------------------------
        //--------------------------------------------------------------

        //--------------------------------------------------------------
        //data output
        //--------------------------------------------------------------
        const allTaskquery = 'SELECT task_id, task_name, task_description, task_owner, task_creator, task_plan, task_createdate from task where task_state = ?';
        const [taskslist] = await client.query(allTaskquery, [Task_state]);
        if(taskslist.length > 0){
            clean_tasklist = [];

            taskslist.forEach((eachTask) => {
                var new_eachTask = {
                    "Task_id": eachTask.task_id,
                    "Task_Name": eachTask.task_name,
                    "Task_description": eachTask.task_description,
                    "Task_owner": eachTask.task_owner,
                    "Task_creator": eachTask.task_creator,
                    "Task_plan": eachTask.task_plan,
                    "Task_createDate": eachTask.task_createdate

                }

                clean_tasklist.push(new_eachTask);
            });

            await client.query('COMMIT');
            res.status(200).json(clean_tasklist);
        }
        else{
            await client.query('COMMIT');

            // Send response with empty users array
            res.status(200).json([]);
        }

    } catch (err) {
        // throw err;
        await client.query('ROLLBACK');

        return next(new ErrorHandler('DO500', 500));
    }
    finally {
        client.release(); // Release the client back to the pool
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
//---------------------------------------------
//---------------------------------------------

module.exports.updateTaskStatetoDone = catchAsyncErrors (async (req, res, next) => {
    const client = await dbconnection.promise().getConnection();

    try {
        await client.query('START TRANSACTION');

        //--------------------------------------------------------------
        //payload check
        //--------------------------------------------------------------
        //all field must be string

        if(!req.body){
            return next(new ErrorHandler('P400', 400));
        }

        const task_info = req.body;

        if(!task_info.username || task_info.username ===""){
            return next(new ErrorHandler('P400', 400));
        }
        else if(typeof task_info.username !== "string"){
            return next(new ErrorHandler('P400', 400));
        }
        else{
            var username = task_info.username;
        }
        
        //================================================================
        if(!task_info.password || task_info.password ===""){
            return next(new ErrorHandler('P400', 400));
        }
        else if(typeof task_info.password !== "string"){
            return next(new ErrorHandler('P400', 400));
        }
        else{
            var password = task_info.password;
        }

        // //================================================================
        // if(!task_info.Task_app_Acronym || task_info.Task_app_Acronym ===""){
        //     return next(new ErrorHandler('P400', 400));
        // }
        // else if(typeof task_info.Task_app_Acronym !== "string"){
        //     return next(new ErrorHandler('P400', 400));
        // }
        // else{
        //     var Task_app_Acronym = task_info.Task_app_Acronym;

        //     //Task_app_Acronym must exist in app table
        //     const check_appacronym_query = 'SELECT app_acronym from app where app_acronym = ?';
        //     const [rows] = await client.query(check_appacronym_query, [Task_app_Acronym]);
        //     if(rows.length < 1){
        //         return next(new ErrorHandler('P400', 400));
        //     }
        // }

        //================================================================
        if(!task_info.Task_id || task_info.Task_id ===""){
            return next(new ErrorHandler('P400', 400));
        }
        else if(typeof task_info.Task_id !== "string"){
            return next(new ErrorHandler('P400', 400));
        }
        else{
            var Task_id = task_info.Task_id;
            var Task_app_Acronym = "";

            //Task_app_Acronym must exist in app table
            const check_taskid_query = "SELECT task_app_acronym from task where task_id = ? and task_state = 'doing'";
            const [rows2] = await client.query(check_taskid_query, [Task_id, Task_app_Acronym]);
            if(rows2.length < 1){
                return next(new ErrorHandler('P400', 400));
            }
            else{
                Task_app_Acronym = rows2[0].task_app_acronym;
            }


            
        }

        //--------------------------------------------------------------
        //--------------------------------------------------------------


        //--------------------------------------------------------------
        //authenticate
        //--------------------------------------------------------------
        //make sure that username are valid 
        const check_crediential_query = 'SELECT password, status FROM tms_users WHERE username = ?';
        const [user_details] = await client.query(check_crediential_query, [username]);
        if(user_details.length < 1){
            return next(new ErrorHandler('A401', 401));
        }

        //make sure that password are valid
        const raw_password = user_details[0].password;
        const isPasswordMatched = await bcrypt.compare(password, raw_password);

        if (!isPasswordMatched) {
            return next(new ErrorHandler('A401', 401));
        }

        //make sure that user is not disable
        const raw_status = user_details[0].status;
        if (raw_status === 0) {
            return next(new ErrorHandler('A401', 401));
        }
        //--------------------------------------------------------------
        //--------------------------------------------------------------

        //--------------------------------------------------------------
        //access rights
        //--------------------------------------------------------------
        const checkGrp2 = await checkGrp(username, Task_app_Acronym, 'app_permit_doing');

        if(!checkGrp2){
            return next(new ErrorHandler('AR403', 403));
        }
        //--------------------------------------------------------------
        //--------------------------------------------------------------

        
        //--------------------------------------------------------------
        //data output
        //--------------------------------------------------------------
        const allTaskNotesquery = 'SELECT task_notes FROM task WHERE task_id = ?';
        const [taskNotes] = await client.query(allTaskNotesquery, [Task_id]);
        if(taskNotes.length > 0){
            const msg = "[" + getCurrentDateTimeFormatted() + ", doing], " + username + " has complete the task. \n#########################################\n";
            var new_notes = msg + taskNotes[0].task_notes;

            const upgradeStatequery = "UPDATE task SET task_state = 'done', task_notes = ?, task_owner = ? where task_id = ?";

            const result = await client.query(upgradeStatequery, [new_notes, username, Task_id]);
            if(result){
                await client.query('COMMIT');

                const grouplist = await checkGrpWithPerm(Task_app_Acronym, 'app_permit_done');
                sendTaskDoneNotification(grouplist, Task_id);

                res.status(200).json({
                    "Task_id": Task_id
                });
            }
        }
    } catch (err) {
        await client.query('ROLLBACK');

        return next(new ErrorHandler('DO500', 500));
    }
    finally {
        client.release(); // Release the client back to the pool
    }
});
