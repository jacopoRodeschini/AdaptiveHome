/*
Compoente che si occupa di gestire delle funzioni comuni ai vari moduli
 */


/*verifica eventuali messaggi nella session*/
var utils = {}


utils.checkSessionMsg = (req)=>{
  var msg = {};
  if(req.session.msg){
    msg.msg = req.session.msg;
    delete req.session.msg;
  }else{
    delete msg.msg
  }
  if(req.session.err){
    msg.err = req.session.err;
    delete req.session.err;
  }else{
    delete msg.err;
  }
  return msg;
}

utils.checkSession = (req) =>{
  if(req.session.uid)return true
  else return false
}


module.exports = utils;
