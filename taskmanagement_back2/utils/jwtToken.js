const jwt = require('jsonwebtoken');

// Create and send token and save in cookie
const sendToken = (username, statusCode, res, req) => {
    //Create JWT Token
    const requester_ip = req.ip;
    const requester_browser = req.headers['user-agent'];

    
    const token = jwt.sign({ username: username, ip: requester_ip, browser: requester_browser }, process.env.JWT_SECRET, {
        expiresIn : process.env.JWT_EXPIRES_TIME
    });


    res
        .status(statusCode)
        .json({
            success : true,
            token
        });
}

module.exports = sendToken;