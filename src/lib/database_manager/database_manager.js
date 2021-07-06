var moment = require('moment');
const uuid = require('uuid');
var admin = require("firebase-admin");
var serviceAccount = require("./adaptivehome-firebase.json");

var db = {};

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://adaptivehome-d952e.firebaseio.com'
});

const fire = admin.firestore(); // istanza cloud firestore

createUser_ = (user) => {
   return {
   email: user.mail,
   emailVerified: false,
   phoneNumber: user.phone,
   password: user.password,
   displayName: user.username,
   disabled: false
 }
}
getUserAcc_ = (user) =>{
  return {
    email: user.email,
    c_mail: user.emailVerified,
    phone: user.phoneNumber,
    user: user.displayName,
    state: ! user.disabled
  }
}
getfunctionsDoc_ = (body) => {
  return {
    name:body.name,
    code:body.code,
    type:"Binary",
    description: body.description,
    timestamp:  moment()
  }
}
getRoutineDoc_ = (body) => {
  var dt = moment(body.start,"MM/DD/YYYY hh:mm");
  var dtup = moment(body.start,"MM/DD/YYYY hh:mm").add(body.days,'d').add(body.hours,'h');
  return {
    name:body.name,
    function:body.function_code,
    code:body.code,
    type:"Binary",
    timestamp:  moment(),
    start: dt,
    next_time: dtup,
    days: body.days,
    hours:body.hours,
    description: body.description,
    current_value: false,
    next_value:true,
    count:0
  }
}
getPipeDoc_ = (body) => {
  return {
    name:body.name,
    function:body.function,
    value: body.value,
    type:"Binary",
    timestamp:  moment()
  }
}

getSensorsDoc_ = (body) => {
  return {
    name:body.name,
    code:body.code,
    type:"Analog",
    description: body.description,
    timestamp:  moment()
  }
}

getAccountDoc_ = () => {
  return {
    apiKey:uuid.v4(),
    functionStat:{count:0,request_min:0,request_tot:0},
    pipeStrat:{count:0,request_min:0,request_tot:0},
    status:"Active"
  }
}

checkCode = (code)=> {return true;}

db.createUser = (usr) => {
  return new Promise((res,rej) =>{
    admin.auth().createUser(createUser_(usr))
    .then(user => {
      var data = getAccountDoc_();
      fire.collection(user.uid).doc('account').set(data,{merge:true})
      fire.collection('API').doc(data.apiKey).set({apikey:data.apiKey,uid:user.uid},
        {merge:true})
      .then((doc) => res(user))
      .catch(e => rej(e))
    })
    .catch(e => {rej(e)})
  })
}

db.gerUserAccount = (uid) => {
  return new Promise((res,rej)=>{
    admin.auth().getUser(uid)
    .then((usr)=> res(getUserAcc_(usr)))
    .catch((e) => rej(null))
  })
}

db.getinfoaccount = async (uid) => {
  var doc = await fire.collection(uid).doc('account').get()
  if(doc != undefined){
    return doc.data()
  }else{
    return undefined
  }
}
db.getUserLogIn = (mail)=>{
  return new Promise((res,rej)=>{
    admin.auth().getUserByEmail(mail)
    .then((usr) => { res(usr)})
    .catch( e => {rej(e)})
  })
}
db.addfunction = async (body,session)=>{
  var uid = session.uid; //ArqapuxXF4ZnEBRV6UzkZtY87RA2
  if(checkCode(body.code)){
    var data = getfunctionsDoc_(body);
        /* acceda alla collezione dell'utente*/
        /* accede al docuemento functions*/
        /* accede alla collezione delle funzioni*/
        /* crea un documento associato al codice della funzione*/
        /* inserisce il documento*/
    const doc = await fire.collection(uid).doc('functions')
    .collection('function').doc(data.code).set(data,{merge:true});
  }else{
    throw new Error("Code just used");
  }
}
db.getfunction = async (session)=>{
var uid = session.uid;
try {
  const ref = fire.collection(uid).doc('functions').collection('function')
  const snapshot = await ref.get();

  var ret = []
  if (snapshot.empty) return ret;

  snapshot.forEach(doc => {
    var dt = doc.data()
    dt.timestamp  = moment(dt.timestamp.toDate())
    ret.push(dt)
  });

  return ret

} catch (error) {
  throw new Error("Error");
}
}
db.addroutine = async (body,session)=>{
  var uid = session.uid;
  if(checkCode(body.code) && checkCode(body.function)){
    var data = getRoutineDoc_(body);
    const doc = await fire.collection(uid).doc('routines')
    .collection('routine').doc(data.code).set(data,{merge:true});
  }else{
    throw new Error("Code just used");
  }
}
db.getroutine = async (session)=>{
var uid = session.uid;
try {
  const ref = fire.collection(uid).doc('routines').collection('routine')
  const snapshot = await ref.get();
  var ret = []
  if (snapshot.empty) return ret;

  /*snapshot.forEach(doc =>{
    doc = updateRoutine(doc);
  }*/

  snapshot.forEach(doc => {
    var dt = doc.data()
    dt.next_time  = moment(dt.next_time.toDate())
    ret.push(dt);
  });

  return ret

} catch (error) {
  throw new Error("Error");
  }
}

db.getroutineData = (doc)=>{
  // lista dei documenti da aggiornare
  var list = doc.filter((d)=>{
  return d.next_time.isBefore(moment())
  })

  list.map(d =>{
    var temp = d.current_value;
    var time = d.next_time;
    var m = moment()
    d.current_value = d.next_value
    d.next_value = temp;
    d.next_time = time.add(d.days,'d').add(d.hours,'h');

    while(d.next_time.isBefore(m))
      d.next_time = time.add(d.days,'d').add(d.hours,'h');
    d.count++;
  })


  var list = list.map(item =>{
    return {
      current_value: item.current_value,
      next_value: item.next_value,
      next_time: item.next_time,
      count: item.count,
      function: item.function,
      code: item.code
    }
  })

  // vengono restituite solo le routine che sono state aggiornate
  // inoltre viene restituita solo la lista dei campi agg. e il codice
  // della funzione da eseguire nonchè il codice identificativo
  return list
}

db.updateroutine = async (uid,listUp) => {
  // update in paralello (map) della lista nel db;
  try {
    const all =  await Promise.all(
      listUp.map(async (d) => {
        await fire.collection(uid).doc('routines')
        .collection('routine')
        .doc(d.code)
        .update(d)
      })
    )
  } catch (error) {
    throw new Error("Error");
  }
}


db.addsensor = async (body,session)=>{
  var uid = session.uid;
  if(checkCode(body.code)){
    var data = getSensorsDoc_(body);
    const doc = await fire.collection(uid).doc('sensors')
    .collection('sensor').doc(data.code).set(data,{merge:true});
  }else{
    throw new Error("Code just used");
  }
}

db.getsensors= async (session)=>{
var uid = session.uid;
try {
  const ref = fire.collection(uid).doc('sensors').collection('sensor')
  const snapshot = await ref.get();

  var ret = []
  if (snapshot.empty) return ret;

  snapshot.forEach(doc => {
    ret.push(doc.data());
  });

  return ret
} catch (error) {
  throw new Error("Error");
}
}

/*expose data to API*/

db.checKey = async (apikey) => {
    const ref =  fire.collection('API');
    const snap = await ref.where('apikey','==',apikey).get();
    if(snap.empty){
      return null;
    }
    else{
      var uid;
      snap.forEach(doc => {
        var data = doc.data();
        if(data.apikey == apikey) uid = data.uid;
      });
      return uid
    }
}




/*Export module functions */
module.exports = db;
