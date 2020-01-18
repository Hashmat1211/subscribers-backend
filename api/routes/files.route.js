/* IMPORTING MODULES */
const express = require("express");
const fileController = require("../controllers/files.controller");

/* MIDDLEWARES */
const validateAccessToken = require("../middleware/validateAccessToken");
const fileUpload = require("../middleware/fileUpload");
const checkAuth = require("../middleware/checkAuth");

/* CREATING A ROUTING FUNCTION */
const router = express.Router();

const generateUserId = async (req, res, next) => {
  try {
    req.userId = "5df8a5eda13a33484c1758e5";
    console.log("here in generate user");
    next();
  } catch (error) {
    console.log("generate userId ", error);
  }
};

/* ROUTES */
router.post(
  "/upload",
  generateUserId,
  fileUpload.single("subscriberIds"),
  validateAccessToken,
  fileController.uploadFile
);
router.patch(
  "/update/:fileId",
  generateUserId,
  fileUpload.single("subscriberIds"),
  validateAccessToken,
  fileController.updateFile
);
router.delete("/:fileId", fileController.deleteFileController);
router.get("/getFile/:fileId", fileController.getSingleFile);
router.get("/:userId", generateUserId, fileController.getAllFiles);
router.post("/filename", generateUserId, fileController.checkFileName);

module.exports = router;
