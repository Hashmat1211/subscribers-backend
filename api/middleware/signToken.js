const JWT = require("jsonwebtoken");
const { JWT_SECRET } = require("../dependencies/config");

/* 
    ASSIGNing JWT
*/

const signToken = async user => {
  /* 
        SETTING PAYLOAD WITH _ID AND NAME FROM THE USER
    */

  const payload = {
    _id: user._id,
    name: user.fullName,
    isAccess: user.isAccess
  };

  return JWT.sign(payload, JWT_SECRET, {
    expiresIn: "240h"
  });
};

module.exports = {
  signToken
};
