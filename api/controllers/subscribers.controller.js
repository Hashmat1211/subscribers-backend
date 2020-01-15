// importing dependencies
const fs = require("fs");
/* 
    @ => IMPORTING HELPER FUNCTIONS
*/
const filesHelper = require("../helpers/files.helpers");
const subscribersHelper = require("../helpers/subscribers.helpers");

/* 
    @ => THIS FUNC TAKES THE FILE ID IN PARAMS AND GET ALL ITS SUBSCRIBERS 
    @ => MAKES A DIRECTORY (IF NOT EXIST) IN LOCAL SERVER BASED ON USER ID
    @ => WRITES ALL SUBSCRIBERS INTO JSON FILE AND LETS USER DOWNLOAD
    @ => IF THE FILE IS ALREADY EXIST IN GIVEN PATH, THEN JUST DOWNLOAD IT
*/
const exportSubscribersToJSON = async (req, res, next) => {
  try {
    const fileId = req.params.fileId;
    const file = await filesHelper.getFileById(fileId);
    const userId = file.user;
    const allSubscribers = await subscribersHelper.getSubscribersByFileId(
      fileId
    );

    const fileDirectory = `./jsonFiles/ui-${userId}`;

    const filePath = `${fileDirectory}/fi-${fileId}.json`;
    fs.mkdirSync(fileDirectory, { recursive: true });

    if (fs.existsSync(filePath)) {
      console.log(filePath);
      res.download(filePath);
    } else {
      fs.writeFile(
        filePath,
        JSON.stringify(allSubscribers, null, 4),
        (err, data) => {
          res.download(filePath);
        }
      );
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error: error
    });
  }

  return;
};
/* 
    @ => THIS FUNC TAKES THE FILE ID IN PARAMS AND GET ALL ITS SUBSCRIBERS 
    @ => MAKES A DIRECTORY (IF NOT EXIST) IN LOCAL SERVER BASED ON USER ID
    @ => WRITES ALL SUBSCRIBERS INTO CSV FILE AND LETS USER DOWNLOAD
    @ => IF THE FILE IS ALREADY EXIST IN GIVEN PATH, THEN JUST DOWNLOAD IT
*/
const exportSubscribersToCSV = async (req, res, next) => {
  try {
    const fileId = req.params.fileId;
    const file = await filesHelper.getFileById(fileId);
    const userId = file.user;

    const allSubscribers = await subscribersHelper.getSubscribersByFileId(
      fileId
    );

    /*  needs commenting */
    const fileDirectory = `./csvFiles/ui-${userId}`;
    const filePath = `${fileDirectory}/fi-${fileId}.csv`;

    fs.mkdirSync(fileDirectory, { recursive: true });

    if (fs.existsSync(filePath)) {
      res.download(filePath);
    } else {
      const csvString = await subscribersHelper.parseJSONToCSVStr(
        allSubscribers
      );
      fs.writeFile(filePath, csvString, (err, data) => {
        res.download(filePath);
      });
    }
  } catch (error) {
    return res.status(500).json({ message: "error" });
  }
};
/* 
    @ => THIS FUNC SEND ALL SUBSCRIBERS ASSOCIATED WITH A FILE IN RESPONSE
*/
const getAllSubscribers = async (req, res, next) => {
  try {
    const fileId = req.params.fileId;
    const allSubscribers = await subscribersHelper.getSubscribersByFileId(
      fileId
    );
    res.status(200).json({
      allSubscribers
    });
  } catch (error) {
    return res.status(500).json({
      err: error
    });
  }
};
/* 
    THIS FUNC SENDS SINGLE SUBSCRIBER'S INFO BY ACCEPTING SUBSCRIBER ID
*/
const getSingleSubscriber = async (req, res, next) => {
  try {
    const subscriberId = req.params.subscriberId;
    console.log(subscriberId);
    const subscriber = await getSubscriberBySubscriberId({ _id: subscriberId });
    if (!subscriber) {
      res.status(403).json({
        error: "no data found"
      });
    } else {
      res.status(200).json({
        subscriber: subscriber
      });
    }
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  exportSubscribersToCSV,
  exportSubscribersToJSON,
  getAllSubscribers,
  getSingleSubscriber
};
