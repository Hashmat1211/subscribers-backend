const mongoose = require('mongoose');
// importing Schemas
const File = require('../models/file.model');
//importing controllers
const SubscribersController = require('./subscribers.controller');

/* 
           @ => UPLOAD FUNCTION GETS FILE PATH, NAME AND accessToken FROM '/UPLOAD' ENDPOINT
           @ => GETS THE FILE SAVED INTO THE DATABASE AND IF ALREADY 
                   EXISTED THEN IT DELETES IT FIRST AND THEN SAVE A NEW FILE
           @ => IF FILE ALREADY EXISTS, THEN IT ALSO DELETES
                   ITS SUBSCRIBERS AND THEN SAVE FILE INTO THE DB
           @ => GETS THE CSVPATH AND PARSE IT INTO THE ARRAY
           @ => REQUESTS EACH SUBSCRIBERS DATA FROM MANYCHATAPI AGAINST PSID
           @ => SAVES EACH SUBSCRIBERS DATA INTO THE DATABASE 
*/

const uploadFile = async (req, res, next) => {
    try {
        const csvFilePath = './upload/' + req.count + '/' + req.filename;
        const accessToken = req.body.accessToken;
        const fileName = req.body.fileName;
        /* 
           @ => ENSURE CSVFILEPATH IS NOT EMPTY
        */

        if (!csvFilePath) {
            return res.status(400).json({
                error: "File is missing"
            });
        }

        if (!fileName) {
            return res.status(400).json({
                error: "Name is missing"
            });
        }

        /* 
            @ => THIS FUNCTION CREATES A NEW FILE IN DB
            @ => IF FILE ALREADY EXISTS, IT DELETES IT AND 
                    THEN CREATE A NEW FILE AND SAVE IT INTO DB
            @ => THIS FUNCTION PASSES FILE ID INTO THE CREATE NEW SUBSCRIBER FUNCTION
        */
        createFile(accessToken, fileName, csvFilePath, req.userId)

        res.status(200).json({
            result: "success"
        })
        // res.send("Thank you for sending ids");
    } catch (error) {
        console.log("error ", error)
        res.status(500).json({
            error: error
        })
    }
}
/* 
    @ => UPDATE FILE FUNCTION UPDATES THE FILE FIELDS EITHER THE FILENAME / accessToken / FILEITSELF
    @ => REQUESTS EACH SUBSCRIBERS DATA FROM MANYCHATAPI AGAINST PSID
    @ => SAVES EACH SUBSCRIBERS DATA INTO THE DATABASE
*/
const updateFile = async (req, res, next) => {
    try {
        const accessToken = req.body.accessToken;
        const fileName = req.body.fileName;
        const userId = req.userId;
        const fileId = req.body.fileId;
        let fullFilePath = req.fullFilePath
        console.log(fullFilePath);

        const updatedData = req.body;
        if (!fullFilePath) {
            File.findOneAndUpdate({ _id: fileId }, updatedData, { upsert: true, new: true }, function (err, doc) {
                if (err) {
                    console.log('err in file access key update', err)
                }
                console.log('doc ', doc);
            })
        } else {
            updatedData.filePath = fullFilePath;
            console.log("updated data ", updatedData)
            File.findOneAndUpdate({ _id: fileId }, updatedData, { upsert: true, new: true }, function (err, doc) {
                if (err) {
                    console.log('err in file access key update', err)
                }
                console.log('doc when file existed ', doc);
            })
        }
        /* 
           @ => ENSURE CSVFILEPATH IS NOT EMPTY
        */
        /* 
            @ => THIS FUNCTION CREATES A NEW FILE IN DB
            @ => IF FILE ALREADY EXISTS, IT DELETES IT AND 
                    THEN CREATE A NEW FILE AND SAVE IT INTO DB
            @ => THIS FUNCTION PASSES FILE ID INTO THE CREATE NEW SUBSCRIBER FUNCTION
        */

        createFile(accessToken, fileName, fullFilePath, userId)

        res.status(200).json({
            result: "success"
        })
        // res.send("Thank you for sending ids");
    } catch (error) {
        console.log("error ", error)
    }
}

const createFile = async (accessToken, fileName, csvFilePath, userId) => {
    try {

        const existingFile = await File.findOne({ accessToken: accessToken });

        // console.log(existingFile)
        if (!existingFile) {
            console.log('file does not exist')
        } else {
            console.log('inside existing file check');
            await deleteFile(existingFile._id)
        }
        const file = new File({
            _id: mongoose.Types.ObjectId(),
            fileName: fileName,
            accessToken: accessToken,
            filePath: csvFilePath,
            user: userId
        })
        // console.log("accessToken", accessToken);
        const newlyCreatedFile = await file.save();
        SubscribersController.createSubscribers(file)
        // console.log("newlycreated file ", newlyCreatedFile);

    } catch (error) {
        console.log("create file error ", error)
    }
}

const getFileId = async (req, res, nex) => {
    const accessToken = req.body.accessToken;

    const existingFile = await File.findOne({ accessToken: accessToken });

    // console.log(existingFile)
    if (!existingFile) {
        console.log('file does not exist')
    } else {
        console.log('inside existing file check');
        await SubscribersController.deleteFileSubscribers(existingFile._id);
        await deleteFile(existingFile._id)
    }
}
/* 
    helper function for deleting files
*/
const deleteFile = async (_id) => {
    try {
        await SubscribersController.deleteFileSubscribers(_id);
        await File.deleteOne({ _id });
        console.log('file deleted')
    } catch (error) {
        console.log('not removed ', error)
    }
}

const refreshFile = async (req, res, nex) => {
    const fileId = req.params.fileId;
    const file = getFileById(fileId);
    const { accessToken, fileName, csvFilePath, userId } = file;
    createFile(accessToken, fileName, csvFilePath, userId)
}
const deleteFileController = async (req, res, nex) => {
    try {
        const fileId = req.params.fileId;
        console.log('inside delete file controller ', fileId);
        /* 
            @ => this function deletes a file and its subscribers
        */
        await deleteFile(fileId)
        return res.status(200).json({
            message: 'file is delete along with its subscribers'
        })

    } catch (error) {
        console.log('err in delete file controller ', error)
    }
}
const getAllFiles = async (req, res, nex) => {
    try {
        const userId = req.params.userId;
        console.log(userId)
        const allFiles = await File.find({ user: userId }).exec();
        if (allFiles.length >= 1) {
            return res.status(200).json({
                files: allFiles
            })
        } else {
            return res.status(403).json({
                message: 'files not found for this user'
            })
        }
    } catch (error) {
        console.log('err', error)
    }
}
const getFileById = async (fileId) => {
    try {
        const file = await File.findOne({ _id: fileId }).lean().exec();
        if (!file) {
            console.log('file does not exist')
        } else {
            return file;
        }
    } catch (error) {
        console.log(error)
    }
}

module.exports = {
    uploadFile,
    updateFile,
    getFileId,
    getFileById,
    refreshFile,
    deleteFileController,
    getAllFiles,
}