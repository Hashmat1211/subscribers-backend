
const mongoose = require('mongoose');

/*  
    -   IMPORTING SCHEMAS
*/

const File = require('../models/file.model');

/* 
    -   IMPORTING HELPERS 
*/

const SubscribersHelper = require('../helpers/subscribers.helpers');

/* 
    -   HELPER FUNC SENDS A FILE IN RESPONSE
*/

const getFileById = async (fileId) => {
    try {
        const file = await File.findOne({ _id: fileId }).lean().exec();
        if (!file) {
            console.log('file does not exist')
        } else {
            return file;
        }
    } catch (error) {
        throw Error(error)
    }
}

/* 
    -   HELPER FUNC ACCEPTS FILE ID AND DELETE ITS SUBSCRIBERS AND THEN FILE
*/

const deleteFile = async (_id) => {
    try {
        await SubscribersHelper.deleteFileSubscribers(_id);
        await File.deleteOne({ _id });
        console.log('file deleted')
    } catch (error) {
        throw Error(error)
    }
}

/* 
    -   THIS HELPER FUNCTION 4 ARGUMENTS AND DELETE FILE AND ITS SUBSCRIBERS
    -   CREATES A NEW FILE AND SAVES ITS SUBSCRIBERS
*/

const createFile = async (accessToken, fileName, csvFilePath, userId) => {
    try {
        const existingFile = await File.findOne({ accessToken: accessToken });
        if (!existingFile) {
        } else {
            await deleteFile(existingFile._id)
        }
        const file = new File({
            _id: mongoose.Types.ObjectId(),
            fileName: fileName,
            accessToken: accessToken,
            filePath: csvFilePath,
            user: userId
        })
        const newlyCreatedFile = await file.save();
        await SubscribersHelper.createSubscribers(newlyCreatedFile);
    } catch (error) {
        throw Error(error)
    }
}
/* 
    -   THIS FUNC TAKES FILE ID AND DATA TO UPDATE
*/
const findAndUpdateFile = async (fileId, updatedData) => {
    try {
        await File.findOneAndUpdate({ _id: fileId }, updatedData, { upsert: true, new: true }, function (err, doc) {
            if (err) {
                throw Error(err)
            }
        })

    } catch (error) {
        throw Error(error)
    }
}
/* 
    -   FUNC TAKES USER ID AND SENDS ALL ITS FILES
*/
const getAllFilesByUserId = async (userId) => {
    try {
        return await File.find({ user: userId }).lean().exec();
    } catch (error) {
        throw Error(error)
    }
}

module.exports = {
    createFile,
    findAndUpdateFile,
    getAllFilesByUserId,
    getFileById,
    deleteFile
}
