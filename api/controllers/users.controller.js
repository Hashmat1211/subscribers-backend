const User = require("../models/user.model");
const signToken = require("../middleware/signToken");

/* 
**************************************************************
CHECK IF THE USER IS ALREADY IN THE DATABASE
ELSE SAVE A NEW USER IN THE LOCAL DB OF SUBSCRIBERS
**************************************************************
*/
const login = async (req, res, next) => {
  try {
    /* DECONSTRUCT THE _ID AS UID AND NAME FROM USERDATA FROM JWT */
    const { _id: authId, name, isAllowedOrigins, isAccess } = req.userData;
    console.log("_id, ", _id);
    console.log("name:  ", name);
    console.log("is allowed origins ", isAllowedOrigins);
    console.log("is access ", isAccess);

    /* IF THE ID IS NULL, SIMPLY RETURN WITH THE ERROR CODE */
    if (_id === null || _id === undefined || !isAccess) {
      return res.status(401).json({
        message: "Auth Failed"
      });
    }

    /* FIND THE USER IN THE DB */
    const foundUser = await User.findOne(authId)
      .lean()
      .exec();

    /* IF USER IS NOT IN THE DB, CREATE IT, ELSE ASSIGN A JWT */
    if (!foundUser) {
      const newUser = new User({
        _id: new mongoose.Types.Object(),
        authId: _id,
        fullName: name,
        isAccess: isAccess
      });
      const newlycreatedUser = await newUser.save();
      const token = await signToken(newlycreatedUser);
      return res.status(201).json({
        token
      });
    } else {
      const token = await signToken(foundUser);
      return res.status(201).json({
        token
      });
    }
  } catch (error) {
    console.log("err in login ", error);
    res.status(500).json({
      error: "auth failed"
    });
  }
};

module.exports = {
  login
};
