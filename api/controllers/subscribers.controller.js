// importing dependencies
const mongoose = require('mongoose');
const rp = require('request-promise');
const csv = require('csvtojson')
const replaceall = require('replaceall')
const fs = require('fs');
const fileController = require('../controllers/files.controller')

// importing Schemas
const Subscriber = require('../models/subscriber.model');


const createSubscribers = async (file) => {
    try {
        /* 
           @ => PARSE CSV FILE
           @ => GET IDS OF SUBSCRIBERS
           @ => FETCH EACH SUBSCRIBER DATA
           @ => MOVE NESTED CUSTOMS FIELDS AND TAGS TO THE MAIN OBJECT
           @ => DELETE CUSTOMS AND TAGS KEYS IN THE MAIN OBJECT
           @ => RETURN EACH OBJECT AND SAVE IT INTO THE DATABASE
        */
        // destruct file
        const { filePath, fileName, _id, accessToken } = file;
        /* 
        convert csv into array object
        */
        // console.log(accessToken, "accessToken")
        const subscriberIds = await makeCSVintoArray(filePath);
        console.log('subscribers ', subscriberIds)
        for (const id of subscriberIds) {
            let subscriberData = await getSubscriberInfoFromManychat(accessToken, id)
            // console.log("data ", subscriberData)
            await saveSubscriberData(subscriberData, _id);
        }
    } catch (ex) {
        console.log(" error in create subs ", ex)
    }
}
const getSubscriberInfoFromManychat = async (accessToken, id) => {
    try {
        accessToken = accessToken.trim();
        console.log('id .. in manychAT ', id)
        // console.log(`accessToken ${accessToken} id ${id}`);
        const apiUrl = `https://api.manychat.com/fb/subscriber/getInfo?subscriber_id=${id}`

        var options = {
            uri: apiUrl,
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + accessToken
            },
            json: true/*  */
        };
        const doc = await rp(options)
        const result = await addCustomFieldsIntoMainDocument(doc.data);
        return result;
    } catch (error) {
        console.log("error in apicheck ", error)
    }
}
const addCustomFieldsIntoMainDocument = async (data) => {
    try {
        let customFields = {};
        for (let cf of data.custom_fields) {
            const fieldObj = { ...cf };
            // console.log(fieldObj)
            // console.log(fieldObj.name, i)
            fieldObj.name = replaceall(".", "", fieldObj.name);
            data["cf_" + fieldObj.name] = fieldObj.value;
            customFields[fieldObj.name] = fieldObj.value;
        }
        // console.log(custom_fields)
        const customTags = {}
        for (let ct of data.tags) {
            const tagObj = { ...ct };
            // console.log(tagObj.name, i);
            tagObj.name = replaceall(".", "", tagObj.name);
            data["tag_" + tagObj.name] = true;
            customTags[tagObj.name] = true;
        }
        // console.log(customTags);
        delete data.custom_fields;
        delete data.tags;
        delete data.__v;
        return data;
    } catch (error) {
        console.log("error in add custom ", error)
    }
}
const makeCSVintoArray = async (csvFilePath) => {
    try {
        console.log('csv file path ', csvFilePath)
        const jsonArray = await csv().fromFile(csvFilePath);
        console.log("\n \n \n ", jsonArray, "jsonArray \n \n \n")
        const ids = [];
        jsonArray.map(async psid => {
            try {
                // console.log("psid ", psid.psid)
                ids.push(psid.psid)
            } catch (error) {
                console.log("error in map ", error)
            }
        })
        return ids;

    } catch (error) {

    }
}
const saveSubscriberData = async (subscriberData, fileId) => {
    try {
        // console.log("subs data ", subscriberData)

        const newSubscriber = new Subscriber({
            ...subscriberData
        });
        newSubscriber._id = mongoose.Types.ObjectId();
        newSubscriber.file = fileId;

        // console.log("saved subscriber ", newSubscriber)
        await newSubscriber.save();

    } catch (error) {
        console.log("error in sasubscriber data ", error)
    }
}
const parseJSONToCSVStr = async (jsonData, fileId, userId) => {
    try {
        // console
        if (jsonData.length == 0) {
            return '';
        }
        // let keys = Object.keys(jsonData[1]);
        let columnDelimiter = ',';
        let lineDelimiter = '\n';
        const skipKeys = ["user_refs", "_id", "page_id", "__v"]
        let headerKeys = [];
        for (let i = 0; i < jsonData.length; i++) {
            const obj = jsonData[i];
            const objKeys = Object.keys(obj);
            // console.log(objKeys)
            for (let j = 0; j < objKeys.length; j++) {
                const key = objKeys[j];
                // console.log(key, j, i)
                if (headerKeys.indexOf(key) < 0 && skipKeys.indexOf(key) < 0)
                    headerKeys.push(key);
            }
        }
        // console.log(headerKeys)
        let csvColumnHeader = headerKeys.join(columnDelimiter);
        // console.log(csvColumnHeader)
        let csvStr = csvColumnHeader + lineDelimiter;

        // let	csvStr = '';
        jsonData.forEach(item => {
            // item.tags = "null";
            // item.custom_fields = "null";
            // console.log('item \n \n \n \n \n \n', item)
            headerKeys.forEach((key, index) => {
                // console.log("key", key);
                if (index > 0) {
                    csvStr += columnDelimiter;
                }
                if (item[key] && skipKeys.indexOf(key) < 0) {
                    let itemVal = item[key] + "";
                    if (key.startsWith("tag_")) {
                        console.log('if ', key, item[key], item["name"])
                    }
                    // console.log("itemVal", itemVal);
                    // console.log(itemVal)
                    itemVal = replaceall("\n", "\\n", itemVal);
                    csvStr += itemVal;
                    // console.log(csvStr)
                } else {
                    if (key.startsWith("tag_")) {
                        // console.log('else ', key, item[key], item["name"], item, key.length)
                        csvStr += "false";
                    } else if (key.startsWith("cf_")) {
                        csvStr += "";
                    }
                }
                // console.log("----------------");

            });
            csvStr += lineDelimiter;
        });
        console.log(csvStr)
        return csvStr;
    } catch (error) {
        console.log(error)
    }
}
const exportSubscribersToJSON = async (req, res, next) => {
    try {
        const fileId = req.params.fileId;
        const file = await fileController.getFileById(fileId);
        const userId = file.user;
        const allSubscribers = await getSubscribersByFileId(fileId);

        const fileDirectory = `./jsonFiles/ui-${userId}`;

        const filePath = `${fileDirectory}/fi-${fileId}.json`;
        fs.mkdirSync(fileDirectory, { recursive: true });

        if (fs.existsSync(filePath)) {
            console.log(filePath)
            res.download(filePath);
        } else {
            fs.writeFile(filePath, JSON.stringify(allSubscribers, null, 4), (err, data) => {
                res.download(filePath);
            })
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            error: error
        })
    }

    return
}
const exportSubscribersToCSV = async (req, res, next) => {
    try {
        const fileId = req.params.fileId;
        const file = await fileController.getFileById(fileId);
        const userId = file.user;

        const allSubscribers = await getSubscribersByFileId(fileId);


        const fileDirectory = `./csvFiles/ui-${userId}`;
        const filePath = `${fileDirectory}/fi-${fileId}.csv`;

        fs.mkdirSync(fileDirectory, { recursive: true });

        if (fs.existsSync(filePath)) {
            console.log('inside exist')
            res.download(filePath);
        } else {
            const csvString = await parseJSONToCSVStr(allSubscribers, fileId, userId);
            console.log('inside new ')
            fs.writeFile(filePath, csvString, (err, data) => {
                res.download(filePath);
            })
        }

    } catch (error) {
        console.log("error in all get subss ", error)
    }
}
const deleteFileSubscribers = async (fileId) => {
    try {
        Subscriber.deleteMany({ file: fileId }, (err) => {
            if (err) {
                console.log(err)
            } else {
                console.log('subscribers are deleted')
            }
        });

    } catch (error) {
        return res.status(500).json({
            error: error
        })
    }
}
const getSubscribersByFileId = async (fileId) => {
    try {
        const allSubscriber = await Subscriber.find({ file: fileId }).lean().exec();

        if (allSubscriber.length >= 0) {
            return allSubscriber;
        }
    } catch (error) {
        console.log(error)
    }
}
const getAllSubscribers = async (req, res, next) => {
    try {
        const fileId = req.params.fileId;
        const allSubscribers = await getSubscribersByFileId(fileId);
        res.status(200).json({
            subscribers: allSubscribers
        })

    } catch (error) {
        console.log(error)
    }
}
const getSubscriberById = async (req, res, next) => {
    try {
        const subscriberId = req.params.subscriberId;
        console.log(subscriberId)
        const subscriber = await Subscriber.findOne({ _id: subscriberId });
        if (!subscriber) {
            res.status(403).json({
                error: 'no data found'
            })
        } else {
            res.status(200).json({
                subscriber: subscriber
            })
        }
    } catch (error) {
        console.log(error)
    }
}
module.exports = {
    createSubscribers,
    exportSubscribersToCSV,
    deleteFileSubscribers,
    exportSubscribersToJSON,
    getAllSubscribers,
    getSubscriberById
}