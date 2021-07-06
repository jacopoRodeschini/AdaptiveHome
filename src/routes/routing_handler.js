/*
Questo modulo si occupa di gestire le richieste per cui non è necessario
essere loggati (tipo la home del sito), le pagine protette sono gestite dal
compoente user_interface
 */
var db = require('../lib/database_manager/database_manager.js')
var utils = require('./utils.js')
var express = require('express');
var router = express.Router();


checkSession = (req) =>{
  if(req.session.uid) return true;
  else return false;
}

/* GET single page. */
router.get('/',(req,res)=>{res.render('home');});
router.get('/signup', (req, res) => {res.render('SignUp');});
router.get('/signin', (req, res) => {  res.render('SignIn');});

/* simple home functions */

getMsg = (usr)=> {
  return `Wealkhome ${usr.displayName}`;
}

router.post('/CreateUser', (req, res)=> {
    /*validata data before using!!  (use express-validator)*/
    db.createUser(req.body)
        .then((usr)=>{ req.session.uid = getId(usr);
          req.session.msg = [getMsg(usr)];
          res.redirect('/user/settings')
        })
        .catch((e)=>{
          req.session.err = [e.message]; res.redirect('/')
        })
});

router.post('/LogInUser',(req,res)=>{
  var mail = req.body.mail;
  db.getUserLogIn(mail)
  .then((usr)=>{
    req.session.uid = getId(usr);
    req.session.msg = [getMsg(usr)];
    res.redirect('/user/settings')
  })
  .catch((e)=>{
    req.session.err = [e.message];
    console.log(e)
    res.redirect('/signin')
  })
})

router.get('/getUser',(req, res)=> {
  var uid = req.session.uid;
  if(uid)
    db.gerUserAccount(uid)
    .then(usr => {res.json({flag:true,info:usr})})
    .catch(e => console.log(e))
  else res.json({flag:false})
});

router.get('/getmsg', (req,res)=>{
  var msg = utils.checkSessionMsg(req);
  delete req.session.msg
  delete req.session.err
  res.json(msg)
})

module.exports = router;
