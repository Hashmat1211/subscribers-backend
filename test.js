

const express = require('express')
const app = express()
const fs = require('fs')
const mongoose = require('mongoose')
const File = require('./api/models/file.model')
const Subscriber = require('./api/models/subscriber.model')
const morgan = require('morgan');
const bodyParser = require('body-parser');

// connnecting to MongoDB
mongoose.connect(`mongodb+srv://hashmat2526:superior.com@mflix-kkh9f.mongodb.net/subscribers?retryWrites=true&w=majority`, { useNewUrlParser: true, useCreateIndex: true })


app.use(morgan('dev'));

// adding middleware to parse body of the incoming requests
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/:fileId', async (req, res) => {
    try {
        const fileId = req.params.fileId;
        const allSubscriber = await Subscriber.find({ file: fileId }).lean().exec();
        console.log(allSubscriber)

    } catch (error) {
        console.log(error)
    }
})



































/* const validateKey = async (req, res, next) => {
    try {
        // const accessKey = req.body.accessKey;
        // const filePath = req.body.csvFilePath;
        const path = `./upload/4/4-test.csv`
        const fileContent = fs.readFileSync(path, { encoding: 'utf8' })
        // if(fileContent.length >0)
        const singleSubscriberId = fileContent.split("\n")
        console.log('file ', singleSubscriberId[1].length)
        if (!singleSubscriberId[1].length <= 0) {
            return res.status(403).json({
                result: 'subscriber id is not found'
            })
        } else {
            const subscriberData = await getSubscriberInfoFromManychat(accessKey, singleSubscriberId);
            if (!subscriberData) {
                return res.status(403).json({
                    result: 'subscriber data is not found by manychat api'
                })
            } else {
                next();
            }
        }
    } catch (error) {
        console.error(error);
    }
}

validateKey(); */
/* 
    @ => app.patch('/accesskey/:fileId', async (req, res, next) => {
    try {
        console.log(req.params.fileId)
        const fileId = req.params.fileId;


        const newAccessKey = req.body.newAccessKey;
        console.log(req.body.newAccessKey)
        File.updateOne({ _id: fileId }, {
            accessKey: newAccessKey,
        }, function (err, affected, resp) {
            console.log(resp);
            res.status(200).json({
                result: resp
            })
        })

    } catch (error) {
        console.log("errr ", error)
    }
}) 
*/

app.listen(4141, () => {
    console.log("server is running on port 4141")
})