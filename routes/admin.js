var express = require('express');
var router = express.Router();
const admin=require('../controller/adminMiddleware')
const userMiddleware=require('../controller/usersMiddleware')
const noCache=require('nocache')
router.use(noCache())
/* GET users listing. */

router.get('/',admin.deleted,admin.adminVerify,admin.listUser,admin.AdminControll);
router.get('/login',admin.AdmLogin)
router.post('/login',admin.checkUser)
router.get('/block',admin.listUser,admin.blockUser)
router.get('/delete',admin.listUser,admin.deleteUser)
router.post('/update',admin.listUser,admin.updateUserPost)
router.get('/createUser',admin.createUser)
router.post('/createUser',admin.createDetials,userMiddleware.signupData)
router.get('/logout',admin.logout)
router.post('/search',admin.searchUser)

module.exports = router;
