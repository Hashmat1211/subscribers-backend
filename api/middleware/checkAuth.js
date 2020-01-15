const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../dependencies/config');

/* DECODING JWT */
module.exports = async (req, res, next) => {
    try {
        if (!req.headers.authorization) {
            return res.status(401).json({
                error: `Authentication failed. Please use correct credentials.`
            })
        } else {
            /* FETCH FIRST PART OF THE TOKEN SENT IN HEADERS */
            const token = req.headers.authorization.split(" ")[1];
            const decoded = jwt.verify(token, JWT_SECRET);
            req.userData = decoded;

            /* check if user can access this service */
            /* yes => grant access */
            /* no => return with error code 401 */

            next();
        }


        next();
    } catch (error) {
        return res.status(401).json({
            message: "Auth Failed"
        })
    }
}