const env = require('../../env.json');
const verifyUserToken = (req, res, next) => {
    next();
    // if (!req.headers.authorization) {
    //     return res.status(401).json({
    //         error: `Authentication failed. Please use correct credentials.`
    //     })
    // } else {
    //     const token = req.headers.authorization;
        
    //     if(token === env.authorization)
    //         next();
    //     else
    //         return res.status(401).json({
    //             error: err
    //         })     
    // } 
};

module.exports = verifyUserToken;