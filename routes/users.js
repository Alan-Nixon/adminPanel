const express = require('express');
const router = express.Router();
const noCache=require('nocache')
router.use(noCache())
const users=require('../controller/usersMiddleware')


router.get('/',users.loginVerify,users.deleteUser,users.userBlocked,users.homePage);
router.get('/login',users.loginPage)
router.get('/signup',users.signupPage)
router.post('/login',users.userBlockedLogin,users.AlreadyExist)
router.post('/signup',users.signupData)
router.get('/logout',users.logout)


module.exports = router;
