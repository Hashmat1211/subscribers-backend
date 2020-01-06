// importing dependencies
const express = require('express');
const fileController = require('../controllers/files.controller');
const validateAccessToken = require('../middleware/validateAccessToken')

// adding middleware
const checkAuth = require('../middleware/checkAuth');
// const fileUpload = require('../middleware/fileUpload');
console.log('before')
const fileUpload = require('../middleware/fileUpload');
console.log('after')

// Creating a router object
const router = express.Router();

const generateUserId = async (req, res, next) => {
    try {

        req.userId = '5df8a5eda13a33484c1758e5',
            // console.log(req)
            next();
    } catch (error) {
        console.log('generate userId ', error)
    }
}


router.get('/upload', generateUserId, fileUpload.single('subscriberIds'), validateAccessToken, fileController.uploadFile);
router.patch('/update', generateUserId, fileUpload.single('subscriberIds'), validateAccessToken, fileController.updateFile);
router.post('/refresh/:fileId', fileController.refreshFile);
router.delete('/:fileId', fileController.deleteFileController);
router.get('/:userId', generateUserId, fileController.getAllFiles);

module.exports = router;