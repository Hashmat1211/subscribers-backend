/* IMPORTING MODULES */
const express = require("express");
const fileController = require("../controllers/files.controller");
const validateAccessToken = require("../middleware/validateAccessToken");

/* MIDDLEWARES */

const checkAuth = require("../middleware/checkAuth");

/* MIDDLEWARES */

const fileUpload = require("../middleware/fileUpload");

/* CREATING A ROUTING FUNCTION */
const router = express.Router();

const generateUserId = async (req, res, next) => {
  try {
    console.log("\n req.body", req.body);
    req.userId = "5df8a5eda13a33484c1758e5";
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
  "/update",
  generateUserId,
  fileUpload.single("subscriberIds"),
  validateAccessToken,
  fileController.updateFile
);
router.post("/refresh/:fileId", fileController.refreshFile);
router.delete("/:fileId", fileController.deleteFileController);
router.get("/:userId", generateUserId, fileController.getAllFiles);

module.exports = router;
