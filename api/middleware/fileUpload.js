/* 
    -   IMPORTING MODULES
*/
const multer = require("multer");
const fs = require("fs");

/* MULTER FUNCTIONS */

const count = 4;
console.log("count", count);
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log("fileUpload", "destination");
    cb(null, "upload/" + count + "/");
  },
  filename: (req, file, cb) => {
    console.log("fileUpload", "filename");

    /* IF FILE ALREADY EXISTS, DELETE THE PREVIOUS FILE */
    try {
      console.log("sad;lfkjasdl;fj;alsdfa;sldkfj lasdkjf ;ld");
      console.log(file);
      console.log("file name ", file.originalname);
      const fullFilePath = `./upload/${count}/${count}-${file.originalname}`;
      /* IF FILE EXISTS, THEN DELETE THE FILE AND PASTE A NEW FILE THERE */

      if (fs.existsSync(fullFilePath)) {
        fs.unlinkSync(fullFilePath);
        // fs.mkdirSync(`./upload/${count}`, { recursive: true })
      }
      /* 
        IF A FILE IN THE GIVEN DIRECTORY DOES NOT EXIST
        ,THEN CREATE A NEW FILE THERE OTHERWISE LEAVE AS IT IS
      */
      fs.mkdirSync(`./upload/${count}`, { recursive: true });
      const fileName = `${count}-${file.originalname}`;
      req.filename = fileName;
      req.fullFilePath = fullFilePath;
      req.count = count;

      cb(null, fileName, fullFilePath);
    } catch (error) {
      console.log("error in file upload", error);
    }
  }
});

const limits = {
  fileSize: 1024 * 1024 // 1MB
};

const fileFilter = (req, file, cb) => {
  console.log("file.mimetype", file.mimetype);
  if (
    file.mimetype === "text/csv" ||
    file.mimetype === "application/vnd.ms-excel" ||
    file.mimetype === "application/octet-stream" ||
    file.mimetype === "application/csv"
  ) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "ERROR: You are trying to upload a file with unsupported file type. Only .csv files are supported."
      ),
      false
    );
  }
};

/* 
    -   INITIALIZING MULTER
*/
const upload = multer({ storage, limits, fileFilter });

module.exports = upload;
