const User = require('../models/user.model');
const signToken = require('../middlewares/signToken');


const login = async (req, res, next) => {
    try {

        /* 
        **************************************************************
        CHECK IF THE USER IS ALREADY IN THE DATABASE
        ELSE SAVE A NEW USER IN THE LOCAL DB OF SUBSCRIBERS
        **************************************************************
        */

        /* DECONSTRUCT THE _ID AS UID AND NAME FROM USERDATA FROM JWT */
        const { _id: uid, name } = req.userData;

        // IF THE ID IS NULL, SIMPLY RETURN WITH THE ERROR CODE
        if (_id === null || _id === undefined) {
            return res.status(401).json({
                message: 'Auth Failed'
            })
        }

        // FIND THE USER IN THE DB
        const foundUser = await User.findOne(uid);

        // IF USER IS NOT IN THE DB, CREATE IT, ELSE ASSIGN A JWT
        if (!foundUser) {
            const newUser = new User({
                uid: _id,
                name
            });
            const newlycreatedUser = await newUser.save();
            const token = await signToken(newlycreatedUser);
            return res.status(201).json({
                token
            })
        } else {
            const token = await signToken(foundUser);
            return res.status(201).json({
                token
            })
        }
    } catch (error) {
        console.log("errorr in server", error)
        res.sendStatus(500).json({
            error: error
        })
    }
}

module.exports = {
    login
}