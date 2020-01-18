/*  IMPORTING MODULES */
const express = require("express");
/* IMPORTING OAUTH VALIDATION MIDDLEWARE */
const checkAuth = require("../middleware/checkAuth");
/* IMPORTING CONTROLLER */
const subscriberController = require("../controllers/subscribers.controller");

/* CREATING ROUTER FUNCTION */
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
/* SUBSCRIBERS ROUTES */

router.get(
  "/export/json/:fileId",
  subscriberController.exportSubscribersToJSON
);
router.get("/export/csv/:fileId", subscriberController.exportSubscribersToCSV);
router.get("/:fileId", subscriberController.getAllSubscribers);
router.post(
  "/refresh/:fileId",
  generateUserId,
  subscriberController.refreshSubscribers
);
router.get("/single/:subscriberId", subscriberController.getSingleSubscriber);

module.exports = router;
