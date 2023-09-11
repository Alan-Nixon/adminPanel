const { Admin } = require('mongodb')
const adminDB = require('../controller/DataBase')
const session = require('express-session')
const userMiddleware = require('./usersMiddleware')
const bcrypt = require('bcrypt')


let AdminControll = ((req, res, next) => {
    req.session.callFromAdmin=false
    if (req.session.search) {
        req.session.search = false
        res.render('admin', { users: req.session.searchDocs })
    } else {
        res.render('admin', { users: res.users })
    }
})

let AdmLogin = ((req, res, next) => {
    if (req.session.adminVerify) {
        res.redirect('/admin')
    } else {
        if (req.session.notAdmin) {
            req.session.notAdmin = false
            res.render('adminLogin', { notAdmin: true, passErr: false , loginDetialsErr:false})
        } else if (req.session.passErr) {
            req.session.passErr = false
            res.render('adminLogin', { notAdmin: false, passErr: true, loginDetialsErr:false })
        } else if (req.session.loginDetialsErr) {
            req.session.loginDetialsErr=false
            res.render('adminLogin',{notAdmin:false,passErr:false,loginDetialsErr:true})
        } else {
            res.render('adminLogin', { notAdmin: false, passErr: false, loginDetialsErr:false })
        }

    }
})


let adminVerify = ((req, res, next) => {
    (req.session.adminVerify) ? next() : res.redirect('admin/login')
})

let checkUser = async (req, res, next) => {
    let adminDetials = await adminDB.findOne({ email: req.body.email })
    if (adminDetials) {
        if (adminDetials.Admin === true) {
            let passTrue = await bcrypt.compare(req.body.password, adminDetials.password)
            if (passTrue) {
                req.session.adminVerify = true
                req.session.adminEmail=adminDetials.email
                res.redirect('/admin')
            } else {
                req.session.passErr = true
                res.redirect('login')
            }


        } else {
            req.session.notAdmin = true
            res.redirect('login')
        }
    } else {
        req.session.loginDetialsErr = true
        res.redirect('login')
    }
}

let listUser = async (req, res, next) => {
    res.users = await adminDB.find().sort({ Name: 1 })
    next()
}

let blockUser = async (req, res, next) => {
    try {
        const { id, status } = req.query;
        if (status === "Active") {
            await adminDB.updateOne({ _id: id }, { $set: { status: "blocked" } })
        } else {
            await adminDB.updateOne({ _id: id }, { $set: { status: "Active" } })
        }
    } catch (err) {
        console.log(err);
    } finally {
        res.redirect('/admin')
    }
};


let deleteUser = async (req, res, next) => {
    let id = req.query.id
    let user = false
    req.session.deleteAdmin=true
    user = await adminDB.findById(id)
    if (user) {
        await adminDB.findByIdAndDelete(id)
        res.redirect('/admin')
    } else {
        res.redirect('/admin')
    }
}



let updateUserPost = async (req, res, next) => {
    let {id,Name,email}=req.body
    let status=req.body.status.trim()
    let Newstatus = (status === "true") ? true : false
    await adminDB.findByIdAndUpdate(id, {
        $set: {
            Name: Name,
            email: email,
            Admin: Newstatus
        }
    })
    req.session.deleteAdmin=true
    res.redirect('/admin')
}
let createUser = (req, res) => {
    res.render('createUser')
}
let createDetials = (req, res, next) => {
    req.session.callFromAdmin = true
    console.log(req.body);
    next()
}

let logout = (req, res, next) => {
    console.log("logout done");
    req.session.adminVerify = false
    res.redirect('login')
}

let searchUser = async (req, res, next) => {
    let search = '^' + req.body.search
    if (req.body.search !== '') {
        let docs = await adminDB.find({ $or: [{ Name: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }] })
        console.log(docs);
        req.session.searchDocs = docs
        req.session.search = true
        res.redirect('/admin')
    } else {
        res.redirect('/admin')
    }
}

let deleted=async(req,res,next)=>{
    if(req.session.deleteAdmin){
        console.log("main router");
        let adminDb=await adminDB.find({email:req.session.adminEmail})
        console.log(adminDb,adminDb.length,adminDb.Admin);
        if(adminDb.length===0 || adminDb[0].Admin===false){
            req.session.adminVerify=false
            req.session.deleteAdmin=false
            console.log("call comed here");
            res.redirect('/admin')
        }else if(adminDb.length!==0 && adminDb[0].Admin===true){
            next()
        }
    }else{
        next()
    }
}

module.exports = {
    AdminControll, AdmLogin, adminVerify, checkUser, createUser, createDetials,
    listUser, blockUser, deleteUser, updateUserPost, logout, searchUser,deleted
}