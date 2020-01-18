const mongoose = require("mongoose");
const Subscriber = require("../models/subscriber.model");
const path = require("path");
var rp = require("request-promise");
const csv = require("csvtojson");
const replaceall = require("replaceall");
const workerPath = path.resolve("api/helpers/workerMethod.js");
const chalk = require("chalk");
const { Worker } = require("worker_threads");

const createSubscribers = async file => {
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
    console.log("create subs file path ", filePath);
    /* convert csv into array object */
    // console.log(accessToken, "accessToken")
    const subscriberIds = await makeCSVintoArray(filePath);
    console.log("subss ids ", subscriberIds);
    /* if length greater than 1000, then make segments for worker threads */
    if (subscriberIds.length > 1000) {
      console.log("if");
      /* SEND FILE ID ALONG WITH TO SAVE SUBSCRIBERS INTO DB */
      await makeSegmentsForWorker(subscriberIds, accessToken, _id);
    } else {
      console.log("else");
      for (const id of subscriberIds) {
        const subscriberData = await getSubscriberInfoFromManychat(
          accessToken,
          id
        );
        /* console.log("data ", subscriberData); */
        await saveSubscriberData(subscriberData, _id);
      }
    }
  } catch (ex) {
    console.log(" error in create subs ", ex);
  }
};
const getSubscriberInfoFromManychat = async (accessToken, id) => {
  try {
    console.log("accessToken ");
    accessToken = accessToken.trim();
    // console.log(`accessToken ${accessToken} id ${id}`);
    const apiUrl = `https://api.manychat.com/fb/subscriber/getInfo?subscriber_id=${id}`;

    var options = {
      uri: apiUrl,
      method: "GET",
      headers: {
        Authorization: "Bearer " + accessToken
      },
      json: true /*  */
    };
    const doc = await rp(options);
    console.log("doc ... in api check ", doc);
    const result = await addCustomFieldsIntoMainDocument(doc.data);
    console.log("result ... in api check ", result);
    return result;
  } catch (error) {
    console.log("error in apicheck ", error);
  }
};
const addCustomFieldsIntoMainDocument = async data => {
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
    const customTags = {};
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
    console.log("error in add custom ", error);
  }
};
const makeCSVintoArray = async csvFilePath => {
  try {
    const jsonArray = await csv().fromFile(csvFilePath);
    /* console.log("\n \n \n ", jsonArray, "jsonArray \n \n \n"); */
    const ids = [];
    jsonArray.map(async psid => {
      try {
        ids.push(psid.psid);
      } catch (error) {
        console.log("error in map ", error);
      }
    });
    return ids;
  } catch (error) {
    console.log(error);
  }
};
const saveSubscriberData = async (subscriberData, fileId) => {
  try {
    // console.log("subs data ", subscriberData)
    const newSubscriber = new Subscriber({
      ...subscriberData
    });
    newSubscriber._id = new mongoose.Types.ObjectId();
    newSubscriber.file = fileId;

    // console.log("saved subscriber ", newSubscriber);
    await newSubscriber.save();
  } catch (error) {
    console.log("error in sasubscriber data ", error);
  }
};
const parseJSONToCSVStr = async jsonData => {
  try {
    // console
    console.log("json data ", jsonData);
    console.log(Object.keys(jsonData));
    if (jsonData.length == 0) {
      return "";
    }
    // let keys = Object.keys(jsonData[1]);
    let columnDelimiter = ",";
    let lineDelimiter = "\n";
    const skipKeys = ["user_refs", "_id", "page_id", "__v"];
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
            console.log("if ", key, item[key], item["name"]);
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
    return csvStr;
  } catch (error) {
    console.log(error);
  }
};
const deleteFileSubscribers = async fileId => {
  try {
    Subscriber.deleteMany({ file: fileId }, err => {
      if (err) {
        console.log(err);
      } else {
        console.log("subscribers are deleted");
      }
    });
  } catch (error) {
    return res.status(500).json({
      error: error
    });
  }
};
const getSubscribersByFileId = async fileId => {
  try {
    console.log("inside getsubscribers help func");
    return await Subscriber.find({ file: fileId })
      .lean()
      .exec();
  } catch (error) {
    console.log(error);
  }
};
const getSubscribersBySubscriberId = async subscriberId => {
  try {
    return await Subscriber.find({ _id: subscriberId })
      .lean()
      .exec();
  } catch (error) {
    console.log(error);
  }
};
const makeSegmentsForWorker = async (subscribersArray, accessToken, fileId) => {
  try {
    /* initializing a counter to keep track of the workers' */
    /* progress */
    let count = 0;
    /* number of workers */
    const numberOfWorkers = 4;
    const segmentSize = Math.ceil(subscribersArray.length / numberOfWorkers);
    const segments = [];

    for (let segmentIndex = 0; segmentIndex < numberOfWorkers; segmentIndex++) {
      const start = segmentIndex * segmentSize;
      const end = start + segmentSize;
      const segment = subscribersArray.slice(start, end);
      segments.push(segment);
    }
    var promises = segments.map(
      (segment, i) =>
        new Promise((resolve, reject) => {
          const workerOptions = {
            workerData: {
              subscribersSegment: segment,
              workerId: i + 1,
              accessToken
            }
          };
          const worker = new Worker(workerPath, workerOptions);

          /* handling 'message' events */
          worker.on("message", async data => {
            /* getting subscribers data in 'data' field */
            // console.log("data ", data);

            /* resolving the promise */

            count++;
            console.log(`Processed: ${count}`);
            await saveSubscriberData(data, fileId);
            resolve(data);
          });
          worker.on("error", err => {
            /* logging the error message to the console */
            console.log(
              chalk.red.bold.inverse(
                ` 'error' message recieved from child worker `
              )
            );
            console.log(err);
          });
          worker.on("exit", code => {
            /* this code runs in case the incoming error */
            /* is non-zero */

            /* rejecting the promise with an exception */
            console.log(
              `=================================== ${code} ===================================`
            );
            reject(new Error(`Worker stopped with exit code ${code}`));
          });
        })
    );

    return Promise.all(promises);
  } catch (error) {
    console.log("err in makeSegmentsForWorker ", error);
  }
};
module.exports = {
  createSubscribers,
  getSubscriberInfoFromManychat,
  addCustomFieldsIntoMainDocument,
  makeCSVintoArray,
  saveSubscriberData,
  parseJSONToCSVStr,
  deleteFileSubscribers,
  getSubscribersByFileId,
  getSubscribersBySubscriberId
};
