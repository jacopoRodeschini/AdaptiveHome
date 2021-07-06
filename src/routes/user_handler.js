/**
Le funzioni in questo modulo richiedono che l'utente sia loggato, e sia presente
uid nella sessione.
 */

var moment = require('moment');
var express = require('express');
var router = express.Router();
var utils = require('./utils.js')
var db = require('../lib/database_manager/database_manager.js')

/* The data in the session is lost when the web browser is closed. */
 getId = (usr)=>{
   return usr.uid;
 }

/* middleware to check that user are logged in*/
router.use( (req,res,next)=>{
  if(req.session.uid) next()
  else res.redirect('/signin')
})

/*routin pagine logged in */
router.get('/dashboard',(req, res)=>{res.render('index', { title: 'Express' });});
router.get('/settings', (req, res) => { res.render('settings');});
router.get('/account', (req, res) => {res.render('account');});


/*funzioni back-end*/

router.get('/getInfoAccount',(req,res)=>{
  var uid = req.session.uid
  db.getinfoaccount(uid)
  .then((info)=>{console.log(info);res.json(info)})
  .catch((e) => res.redirect('/'))
})

router.get('/logOut', (req, res)=> {
    delete req.session.uid
    res.redirect('/')
});

router.post('/addfunction',(req,res)=>{
  // check session
  db.addfunction(req.body,req.session)
  .then((doc)=>{req.session.msg = ["Correct update databases"];res.redirect('/user/settings');} )
  .catch((e)=>{req.session.err = [e.message];res.redirect('/');})
});

router.get('/getFunctions',(req,res)=>{
  // check session
  db.getfunction(req.session)
  .then((doc)=>{
    res.json(doc)
  })
  .catch((e)=>{req.session.err = [e.message];})
});

router.post('/addRoutine',(req,res)=>{
  // check session
  db.addroutine(req.body,req.session)
  .then((doc)=>{req.session.msg = ["Correct update databases"];res.redirect('/user/settings');} )
  .catch((e)=>{req.session.err = [e.message];res.redirect('/');})
});

router.get('/getRoutine',(req,res)=>{
  // check session
  db.getroutine(req.session)
  .then((doc)=>{

    /*questa funzione sarebbe meglio farla nel browser*/
    doc.forEach((d)=>{
      d.next_time = d.next_time.format("DD/MMM hh:mm")
    })
    res.json(doc)
  })
  .catch((e)=>{req.session.err = [e.message];})
});


router.post('/addSensor',(req,res)=>{
  // check session
  db.addsensor(req.body,req.session)
  .then((doc)=>{req.session.msg = ["Correct update databases"];res.redirect('/user/settings');} )
  .catch((e)=>{req.session.err = [e.message];res.redirect('/');})
});

router.get('/getSensors',(req,res)=>{
  // check session
  db.getsensors(req.session)
  .then((doc)=>{res.json(doc)})
  .catch((e)=>{req.session.err = [e.message];})
});

module.exports = router;
