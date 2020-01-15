const express = require('express');
const router = express();
const checkAuth = require('../middleware/checkAuth')

const UsersController = require('../controllers/users.controller');

/* 
    -   IF USER HAS VALID JWT FROM MANYTOOLS' ACCOUNT, THEN ACCESS GRANT
*/
router.post('/login', checkAuth, UsersController.login);

module.exports = router;