const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../dependencies/config');

/* 
    DECODING JWT
*/
module.exports = async (req, res, next) => {
    try {
        if (!req.headers.authorization) {
            return res.status(401).json({
                error: `Authentication failed. Please use correct credentials.`
            })
        } else {
            const token = req.headers.authorization.split(" ")[1]; //fetch 1st prt of token n send through headers
            const decoded = jwt.verify(token, JWT_SECRET);
            req.userData = decoded;
            next();
        }

        // check if user can access this service
        // yes => grant access
        // no => return with error code 401
    } catch (error) {
        return res.status(401).json({
            message: "Auth Failed"
        })
    }
}