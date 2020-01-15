/* Contains helper functions of files */

const filesHelper = require("../helpers/files.helpers");

/* 
           -  UPLOAD FUNCTION GETS FILE PATH, NAME AND accessToken FROM '/UPLOAD' ENDPOINT
           -  CREATES A LOCAL DIRECTORY IN SERVER 
           AND SAVE THE INCOMING FILE INTO 'UPLOAD' DIRECTORY BY USER ID 
           AND IF ALREADY EXISTS DELETE IT FIRST AND THEN SAVE IT AGAIN
           -  GETS THE FILE SAVED INTO THE DATABASE AND IF ALREADY 
                   EXISTED THEN IT DELETES IT FIRST AND THEN SAVE A NEW FILE
           -  IF FILE ALREADY EXISTS, THEN IT ALSO DELETES
                   ITS SUBSCRIBERS AND THEN SAVE FILE INTO THE DB
           -  GETS THE CSVPATH AND PARSE IT INTO THE ARRAY
           -  REQUESTS EACH SUBSCRIBERS DATA FROM MANYCHATAPI AGAINST PSID
           -  SAVES EACH SUBSCRIBERS DATA INTO THE DATABASE 
*/
const uploadFile = async (req, res, next) => {
  try {
    /* PATH FROM ALREADY SAVED FILE IN DIRECTORY */
    const csvFilePath = "./upload/" + req.count + "/" + req.filename;
    const accessToken = req.body.accessToken;
    const fileName = req.body.fileName;

    /* ENSURE ACCESSTOKEN IS NOT EMPTY */
    if (!accessToken) {
      return res.status(400).json({
        error: "access token is missing"
      });
    }

    /* ENSURE CSVFILEPATH IS NOT EMPTY */

    if (!csvFilePath) {
      return res.status(400).json({
        error: "File is missing"
      });
    }

    /* ENSURE FILE NAME IS NOT EMPTY */
    if (!fileName) {
      return res.status(400).json({
        error: "Name is missing"
      });
    }

    /* 
            - THIS FUNCTION (files' helper function) CREATES A NEW FILE IN DB
            - IF FILE ALREADY EXISTS, IT DELETES IT AND 
                    THEN CREATE A NEW FILE AND SAVE IT INTO DB
            - THIS FUNCTION PASSES FILE ID INTO THE CREATE NEW SUBSCRIBER FUNCTION
        */
    await filesHelper.createFile(
      accessToken,
      fileName,
      csvFilePath,
      req.userId
    );

    return res.status(200).json({
      result: "file is created"
    });
  } catch (error) {
    return res.status(500).json({
      error: error
    });
  }
};
/* 
    - UPDATE FILE FUNCTION UPDATES THE FILE FIELDS EITHER THE FILE NAME / ACCESS TOKEN / FILE IT SELF
    - REQUESTS EACH SUBSCRIBERS DATA FROM MANYCHATAPI AGAINST PSID
    - SAVES EACH SUBSCRIBERS DATA INTO THE DATABASE
*/
const updateFile = async (req, res, next) => {
  try {
    const userId = req.userId;
    const fileId = req.body.fileId;
    let fullFilePath = req.fullFilePath;

    const updatedData = req.body;
    /* 
            - IF FILE UPDATE IS NOT REQUIRED, UPDATES REQUIRED FIELDS ONLY
        */
    if (!fullFilePath) {
      await filesHelper.findAndUpdateFile(fileId, updatedData);
    } else {
      /* 
            - IF FILE UPDATE IS NOT REQUIRED, UPDATES REQUIRED FIELDS ONLY
            */
      updatedData.filePath = fullFilePath;
      await filesHelper.findAndUpdateFile(fileId, updatedData);
    }
    /* 
            - THIS FUNCTION CREATES A NEW FILE IN DB
            - IF FILE ALREADY EXISTS, IT DELETES IT AND 
                    THEN CREATE A NEW FILE AND SAVE IT INTO DB
            - THIS FUNCTION PASSES FILE ID INTO THE CREATE NEW SUBSCRIBER FUNCTION
        */

    filesHelper.createFile(accessToken, fileName, fullFilePath, userId);

    return res.status(200).json({
      result: "file is updated successfully"
    });
  } catch (error) {
    return res.status(500).json({
      err: "error"
    });
  }
};
/* 
    - THIS FUNC TAKES THE FILE ID AND AND CALL CREATE FUNC
*/
const refreshFile = async (req, res, nex) => {
  try {
    const fileId = req.params.fileId;
    const file = filesHelper.getFileById(fileId);
    const { accessToken, fileName, csvFilePath, userId } = file;
    await filesHelper.createFile(accessToken, fileName, csvFilePath, userId);
  } catch (error) {
    return res.status(500).json({
      err: error
    });
  }
};
const deleteFileController = async (req, res, nex) => {
  try {
    const fileId = req.params.fileId;
    console.log("inside delete file controller ", fileId);
    /* 
            @ => THIS FUNC DELETE FILE AND ITS SUBSCRIBERS
        */
    await filesHelper.deleteFile(fileId);
    return res.status(200).json({
      message: "file is delete along with its subscribers"
    });
  } catch (error) {
    return res.status(500).json({
      err: error
    });
  }
};
/* 
    @ => THIS FUNC GET USER ID AND SEND ALL ITS FILES IN RESPONSE
*/
const getAllFiles = async (req, res, nex) => {
  try {
    const userId = req.params.userId;
    const allFiles = await filesHelper.getAllFilesByUserId(userId);
    if (allFiles.length >= 1) {
      return res.status(200).json({
        allFiles
      });
    } else {
      return res.status(403).json({
        message: "files not found for this user"
      });
    }
  } catch (error) {
    return res.status(500).json({
      err: error
    });
  }
};

module.exports = {
  uploadFile,
  updateFile,
  refreshFile,
  deleteFileController,
  getAllFiles
};
