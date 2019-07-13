'use strict'
const proxyTask = require('./proxytask.js');
const dataStore = require('./lib/datastore.js');
const express = require('express');
const app = express();
const APP_PORT = process.env.PORT || 8080;
const FIRESTORE_COLLECTION_NAME = process.env.COLLECTION_NAME || 'proxylist';

app.get('/',(req,res) => {
  res.sendStatus(403);
});

app.get('/tasks/updateproxy',(req,res) => {
  if (req.header('X-Appengine-Cron') == true){
    proxyTask.updateProxy();
    res.send("OK");
  }
  else {
    res.sendStatus(403);
  }
});

app.get('/proxylist',(req,res)  => {
  proxyTask.getExistProxyList().then(resultProxy => {
    res.send(resultProxy);
  }).catch(err => console.log(err));
});





app.listen(APP_PORT, () => console.log(`Proxy service listening on ${APP_PORT}!`));
//


//GOOGLE_APPLICATION_CREDENTIALS="/home/takumi/Documents/Repository/testgcloud/credential/japan-proxy-badef753aa02.json"

//process.on('uncaughtException',function(err){});
