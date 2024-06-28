const jwt = require('jsonwebtoken');

// Create and send token and save in cookie
const sendToken = (username, statusCode, res, req) => {
    //Create JWT Token
    const requester_ip = req.ip;
    const requester_browser = req.headers['user-agent'];

    // console.log(requester_ip);
    // console.log(requester_browser);
    
    const token = jwt.sign({ username: username, ip: requester_ip, browser: requester_browser }, process.env.JWT_SECRET, {
        expiresIn : process.env.JWT_EXPIRES_TIME
    });

    //Option for cookie
    const options = {
        expires : new Date(Date.now() + process.env.COOKIE_EXPIRES_TIME * 60*60*1000),
        httpOnly : true
    }

    // if(process.env.NODE_ENV === 'production'){
    //     options.secure = true;
    // }

    res
        .status(statusCode)
        .cookie('token', token, options)
        .json({
            success : true,
            token
        });
}

module.exports = sendToken;