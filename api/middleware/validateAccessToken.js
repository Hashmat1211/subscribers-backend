const fs = require("fs");
const File = require("../models/file.model");
const SubscriberHelpers = require("../helpers/subscribers.helpers");

const validateAccessToken = async (req, res, next) => {
  try {
    /* manychat accesstoken needs commenting */
    const accessToken = req.body.accessToken;
    let filePath = req.fullFilePath;
    if (!accessToken) {
      next();
    }
    /* FILE IS EMPTY */
    if (filePath === undefined) {
      console.log("acc token", accessToken);
      /* FIND THE FILE FROM ACCESSTOKEN */
      let file = await File.findOne({ accessToken });
      console.log("file ;", file);
      console.log("new path ", file.filePath);
      if (!file) {
        return res.status(400).json({
          message: "file does not exist for this access token"
        });
      } else {
        console.log("file path old", file.filePath);
        filePath = file.filePath;
      }
      console.log("\n should not execute this \n");
    }
    // const path = `./upload/4/4-test.csv`
    console.log(filePath);
    const fileContent = fs.readFileSync(filePath, { encoding: "utf8" });
    const singleSubscriberId = fileContent.split("\n");
    console.log("file ", singleSubscriberId[1].length);
    console.log("iddddddddddd ", singleSubscriberId[1]);

    if (singleSubscriberId[1].length <= 0) {
      res.status(400).json({
        result: "subscriber id is not valid"
      });
    } else {
      const subscriberData = await SubscriberHelpers.getSubscriberInfoFromManychat(
        accessToken,
        singleSubscriberId[1]
      );
      if (!subscriberData) {
        res.status(204).json({
          result: "subscriber data is not found by manychat api"
        });
      } else {
        console.log("access token is valid");
        next();
      }
    }
  } catch (error) {
    console.log("access token ", req.body);
    console.error("error in validate  accessToken \n", error);
    res.status(400).json({
      err: "token is not validated"
    });
  }
};

module.exports = validateAccessToken;
