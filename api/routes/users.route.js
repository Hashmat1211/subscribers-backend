const express = require('express');
const router = express();
const checkAuth = require('../middleware/checkAuth')

const UsersController = require('../controllers/users.controller');
// if user has a valide jwt token, he's granted access
router.post('/login', checkAuth, UsersController.login);

router.get('/validate/token', checkAuth, UsersController.validateToken);

module.exports = router;