const jwt = require('jsonwebtoken');
require("dotenv").config();

const JWT_KEY = process.env.jwt_key;

const jwtAuthentication = (req, res, next) => {
    console.log("JWT MIDDLEWARE HIT");
    console.log("authHeader:", req.headers.authorization);
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: '인증 토큰 없음', isLogin: false });
    }

    try {
        const decoded = jwt.verify(token, JWT_KEY);
        req.user = decoded;
        console.log(req.user); 
        next();
    } catch (err) {
        return res.status(403).json({ message: '유효하지 않은 토큰', isLogin: false });
    }

};


module.exports = jwtAuthentication;