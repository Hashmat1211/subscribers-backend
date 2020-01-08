const JWT = require('jsonwebtoken');
const { JWT_SECRET } = require('../commons/config');

/* 
    ASSIGNing JWT
*/

const signToken = async user => {

    /* 
        SETTING PAYLOAD WITH _ID AND NAME FROM THE USER
    */

    const payload =
    {
        _id: user.uid,
        name: user.name
    }
    return JWT.sign(payload, JWT_SECRET,
        {
            expiresIn: "240h"
        }
    );
}

module.exports = {
    signToken
}