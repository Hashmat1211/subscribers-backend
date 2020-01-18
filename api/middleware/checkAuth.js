const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../dependencies/config");

/* DECODING JWT */
module.exports = async (req, res, next) => {
  try {
    if (!req.headers.authorization) {
      return res.status(401).json({
        error: `Authentication failed. Please use correct credentials.`
      });
    } else {
      /* FETCH FIRST PART OF THE TOKEN SENT IN HEADERS */
      const token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, JWT_SECRET);

      const { isAllowedOrigins } = decoded;

      /* check if user can access this service */

      await isAllowedOrigins.map(domain => {
        if (domain === "subscribers") {
          /* APPEND USER DATA DECODED FROM JWT IN REQUEST */
          req.userData = decoded;
          /* APPEND NEW FIELD ISACCESS TO TRUE IN REQUEST */
          req.isAccess = true;
          next();
        } else {
          req.isAccess = false;
          return res.status(401).json({
            message: "Auth Failed"
          });
        }
      });

      /* yes => grant access */
      /* no => return with error code 401 */
    }

    next();
  } catch (error) {
    return res.status(401).json({
      message: "Auth Failed"
    });
  }
};
