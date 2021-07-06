var express = require('express');
var moment = require('moment');
var db = require('../lib/database_manager/database_manager.js')
var router = express.Router();


/*middleware per verificare la chiave e il metodo di richiesta*/
router.param('apiKey',(req,res,next,apiKey)=>{
  req.local = {}
  db.checKey(apiKey)
  .then((uid)=>{req.local.checKey=true; req.local.uid = uid; next()})
  .catch((e) => {console.log(e);res.json([])})
})


getDataFunctions = (fun)=>{
return {
  name:fun.name, // nome della routine
  code:fun.code, // codice della funzione da eseguire
  current_value:ppp,
  next_value:ppp,
  time:fun.nect_time,
  count:0
}
}

updateF = (item) =>{
  return item
}


/*routing data for iot-device*/
router.get('/getRoutines/:apiKey', (req,res)=>{
  var uid = req.local.uid;
  if(req.local.checKey){
    db.getroutine({uid:uid})
    .then(async (doc)=>{
      var data = db.getroutineData(doc);
      await db.updateroutine(uid,data) // async call.
      res.json(data)} // questa istruzione viene eseguita dopo aver agg. il db
    )
    .catch((e) =>{res.json(e);})
  }else{
    res.json([])
  }
})



router.get('/getPipes/:apiKey',(req,res)=>{})
module.exports = router;
