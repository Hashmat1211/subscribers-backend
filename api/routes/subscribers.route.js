// importing dependencies
const express = require('express');
const subscriberController = require('../controllers/subscribers.controller');


// Creating a router object
const router = express.Router();

// Get subscribers by manychat key
router.get('/export/json/:fileId', subscriberController.exportSubscribersToJSON);
router.get('/export/csv/:fileId', subscriberController.exportSubscribersToCSV);
router.get('/:fileId', subscriberController.getAllSubscribers);
router.get('/single/:subscriberId', subscriberController.getSubscriberById)

// router.post('/refresh', verifyUserToken, subscriberController.refreshSubscribersList);


// // Creating route for POST request on keys root
// router.post('/', verifyUserToken, fileUpload.single('subscriberIds'), subscriberController.addSubscriber);

// // Creating route for GET request on product page
// router.get('/:productId', productController.getProduct);

// // Creating route for PATCH request on product page
// router.patch('/:productId', verifyUserToken, productController.updateProduct);

// // Creating route for DELETE request on product page
// router.delete('/:productId', verifyUserToken, productController.deleteProduct);

module.exports = router;