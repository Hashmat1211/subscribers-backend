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
    if (filePath === undefined) {
      console.log("acc ", accessToken);
      let file = await File.findOne({ accessToken });
      console.log("new path ", file.filePath);
      if (!file) {
        return res.status(403).json({
          message: "file does not exist"
        });
      } else {
        console.log("file path old", file.filePath);
        filePath = file.filePath;
      }
    }
    // const path = `./upload/4/4-test.csv`
    console.log(filePath);
    const fileContent = fs.readFileSync(filePath, { encoding: "utf8" });
    const singleSubscriberId = fileContent.split("\n");
    console.log("file ", singleSubscriberId[1].length);
    if (singleSubscriberId[1].length <= 0) {
      return res.status(403).json({
        result: "subscriber id is not found"
      });
    } else {
      const subscriberData = await SubscriberHelpers.getSubscriberInfoFromManychat(
        accessToken,
        singleSubscriberId[1]
      );
      if (!subscriberData) {
        return res.status(403).json({
          result: "subscriber data is not found by manychat api"
        });
      } else {
        console.log("access token is valid");
        next();
      }
    }
  } catch (error) {
    console.error(error);
  }
};

module.exports = validateAccessToken;
