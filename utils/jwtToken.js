const jwt = require('jsonwebtoken');

// Create and send token and save in cookie
const sendToken = (user_id, statusCode, res) => {
    //Create JWT Token
    const token = jwt.sign({ id: user_id}, process.env.JWT_SECRET, {
        expiresIn : process.env.JWT_EXPIRES_TIME
    });

    //Option for cookie
    const options = {
        expires : new Date(Date.now() + process.env.COOKIE_EXPIRES_TIME * 24*60*60*1000),
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