const session = require('express-session')
const User = require('./DataBase')
const bcrypt = require('bcrypt')

let loginVerify = (req, res, next) => {
    if (req.session.loggedIn) {
        next()
    } else {
        res.redirect('/login')
    }
}


let homePage = ((req, res, next) => {
    res.render('home', { title: req.session.userName })
})

let signupPage = (req, res, next) => {
    if (req.session.loggedIn) {
         res.redirect('/')
    } else {
        if (req.session.loginCredintials) {
            req.session.loginCredintials = false
            res.render('signup', { loginCredintials: true })
        } else {
            res.render('signup', { loginCredintials: false })
        }
    }
}

let loginPage = ((req, res, next) => {
    if (req.session.loggedIn) {
        res.redirect('/')
    } else {
        if (req.session.fieldEmpty) {
            req.session.fieldEmpty = false;
            res.render('login', { fieldEmptyErr: true, AlreadyExist: false, blocked: false, passwordErr: false })
        } else if (req.session.isBlocked) {
            req.session.isBlocked = false
            res.render('login', { fieldEmptyErr: false, AlreadyExist: false, blocked: true, passwordErr: false })
        } else if (req.session.AlreadyExist) {
            req.session.AlreadyExist = false
            res.render('login', { fieldEmptyErr: false, AlreadyExist: true, blocked: false, passwordErr: false })
        } else if (req.session.passwordErr) {
            req.session.passwordErr = false
            res.render('login', { fieldEmptyErr: false, AlreadyExist: false, blocked: false, passwordErr: true })
        } else {
            res.render('login', { fieldEmptyErr: false, AlreadyExist: false, blocked: false, passwordErr: false })
        }
    }
})

let signupData = async (req, res, next) => {
    const { Name, email, password } = req.body;
    try {
        const documents = await User.find({ email: email });
        if (documents.length === 0) {
            const hashedPassword = await bcrypt.hash(password, 10);
            req.session.user = req.body;
            req.session.userName = Name
            req.session.loggedIn = true;
            req.session.logginedUser=email
            req.body.password = hashedPassword
            req.body.Admin = false
            req.body.status = "Active"
            User.insertMany(req.body)
            if(req.session.callFromAdmin===true){
                req.session.callFromAdmin=false
                console.log("this fucking working");
                res.redirect('/admin')
            }else{
                res.redirect('/');
            }
           
        } else {
            req.session.AlreadyExist = true;
            if(req.session.callFromAdmin){
                res.redirect('/admin')
            }else{
                res.redirect('/login');
            }
            
        }
    } catch (error) {
        console.error(error);
    }
};

let AlreadyExist = async (req, res, next) => {
    User.findOne({ email: req.body.email }).then(async (userDetails) => {
        if (userDetails.length !== 0) {
            const passwordsMatch = await bcrypt.compare(req.body.password, userDetails.password);
            if (passwordsMatch) {
                req.session.loggedIn = true;
                req.session.userName = userDetails.Name
                req.session.logginedUser = req.body.email
                res.redirect('/');
            } else {
                req.session.passwordErr = true
                res.redirect('/login')
            }
        } else {
            req.session.loginCredintials = true
            res.redirect('/signup')
        }
    });
};


let logout = (req, res, next) => {
    req.session.loggedIn = false
    req.session.destroy()
    res.redirect('/login')
}

let userBlockedLogin = async (req, res, next) => {
    let userDoc = await User.findOne({ email: req.body.email })
    if (userDoc) {
        if (userDoc.status === "blocked") {
            req.session.loggedIn = false
            req.session.isBlocked = true
            res.redirect('/login')
        } else {
    next()
        }
    } else {
        if (req.body.email == '') { req.session.fieldEmpty = true; res.redirect('/login') }
        else if (userDoc == null) { req.session.loginCredintials = true; res.redirect('/signup') }
    }
}

let userBlocked = async (req, res, next) => {
    if (req.session.loggedIn) {
        let userDoc = await User.findOne({ email: req.session.logginedUser })
        if (userDoc) {
            if (userDoc.status === "blocked") {
                req.session.loggedIn = false
                req.session.isBlocked = true
                res.redirect('/login')
            } else {
                next()
            }
        } else {
            req.session.loginCredintials = true
            res.redirect('/login')
        }
    } else {
        next()
    }
}

let deleteUser=async(req,res,next)=>{
    if(req.session.logginedUser){
       let document=await User.find({email:req.session.logginedUser})
       if(document.length===0){
        req.session.loggedIn=false
        req.session.logginedUser=null 
        req.session.user=null
        req.session.destroy()
        res.redirect('/login')
       }else{
        next()
       }
    }else{
        res.redirect('/')
    }
  
}

module.exports = {
    homePage, loginPage, signupPage, signupData,deleteUser,
    loginVerify, AlreadyExist, logout, userBlocked, userBlockedLogin
}