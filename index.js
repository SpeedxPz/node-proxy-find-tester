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
  if (req.get('X-Appengine-Cron') !== 'true') {
         return res.sendStatus(403);
  }
  proxyTask.updateProxy();
  res.send("OK");
});

app.get('/proxylist',(req,res)  => {
  proxyTask.getExistProxyList().then(resultProxy => {
    res.send(resultProxy);
  }).catch(err => console.log(err));
});


app.listen(APP_PORT, () => console.log(`Proxy service listening on ${APP_PORT}!`));
