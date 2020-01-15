/* 
    -   IMPORTING MODULES
*/
const express = require('express');
/* 
    -   IMPORTING CONTROLLER
*/
const subscriberController = require('../controllers/subscribers.controller');

/* 
    -   CREATING ROUTER FUNCTION
*/

const router = express.Router();

/* 
    -   SUBSCRIBERS ROUTES
*/

router.get('/export/json/:fileId', subscriberController.exportSubscribersToJSON);
router.get('/export/csv/:fileId', subscriberController.exportSubscribersToCSV);
router.get('/:fileId', subscriberController.getAllSubscribers);
router.get('/single/:subscriberId', subscriberController.getSingleSubscriber)

module.exports = router;