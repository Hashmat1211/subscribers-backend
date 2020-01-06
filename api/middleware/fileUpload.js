// importing dependencies
const multer = require('multer');
const fs = require('fs')

// Storing initParams for multer
// let count = Math.floor(Math.random() * 10 + 1);
const count = 4;
console.log("count = ", count)
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'upload/' + count + '/')
    },
    filename: (req, file, cb) => {
        /* 
            IF FILE ALREADY EXISTS, DELETE THE PREVIOUS FILE 
        */
        try {

            const fullFilePath = `./upload/${count}/${count}-${file.originalname}`;
            /* 
                @ => IF FILE EXISTS, THEN DELETE THE FILE AND PASTE A NEW FILE THERE
            */

            if (fs.existsSync(fullFilePath)) {
                console.log('file exist')
                fs.unlinkSync(fullFilePath);
                fs.mkdirSync(`./upload/${count}`, { recursive: true })
            }
            /* 
                @ => IF A FILE IN THE GIVEN DIR DOES NOT EXIST
                , THEN CREATE A NEW FILE THERE OTHERWISE LEAVE AS IT IS
            */
            fs.mkdirSync(`./upload/${count}`, { recursive: true })
            const fileName = `${count}-${file.originalname}`;
            req.filename = fileName;
            req.fullFilePath = fullFilePath;
            req.count = count;

            cb(null, fileName, fullFilePath)
        } catch (error) {
            console.log('er ', error)
        }
    }
});

const limits = {
    fileSize: 1024 * 1024 // 1MB
};

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'text/csv') {
        cb(null, true);
    } else {
        cb(new Error('ERROR: You are trying to upload a file with unsupported file type. Only .csv files are supported.'), false);
    }
}

// initializing multer
const upload = multer({ storage, limits, fileFilter });

module.exports = upload;