/* 
    -   IMPORTING MODULES
*/
const multer = require("multer");
const fs = require("fs");

/* MULTER FUNCTIONS */

const count = 4;
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "upload/" + count + "/");
  },
  filename: (req, file, cb) => {
    /* IF FILE ALREADY EXISTS, DELETE THE PREVIOUS FILE */
    try {
      console.log("file name ", file.originalname);
      const fullFilePath = `./upload/${count}/${count}-${file.originalname}`;
      /* IF FILE EXISTS, THEN DELETE THE FILE AND PASTE A NEW FILE THERE */

      if (fs.existsSync(fullFilePath)) {
        fs.unlinkSync(fullFilePath);
        // fs.mkdirSync(`./upload/${count}`, { recursive: true })
      }
      /* 
                -   IF A FILE IN THE GIVEN DIR DOES NOT EXIST
                ,THEN CREATE A NEW FILE THERE OTHERWISE LEAVE AS IT IS
            */
      fs.mkdirSync(`./upload/${count}`, { recursive: true });
      const fileName = `${count}-${file.originalname}`;
      req.filename = fileName;
      req.fullFilePath = fullFilePath;
      req.count = count;

      cb(null, fileName, fullFilePath);
    } catch (error) {
      console.log("error", error);
    }
  }
});

const limits = {
  fileSize: 1024 * 1024 // 1MB
};

const fileFilter = (req, file, cb) => {
  if (file.mimetype === "text/csv") {
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
