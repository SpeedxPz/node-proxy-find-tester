'use strict'
const { Firestore } = require('@google-cloud/firestore');
const firestore = new Firestore();


function DataStore (){}

DataStore.getAllProxy = async function(collectionName){
  return new Promise(async function(resolve, reject){
    try{
      let snapshot = await firestore.collection(collectionName).get();
      resolve(snapshot.docs);
    } catch (err){
      reject(err);
    }
  });
}

DataStore.updateProxy = async function(collectionName, proxyList){
  return new Promise(async function(resolve, reject){
    try{
            Promise.all(
              proxyList.map(async function(proxy) {
                return new Promise(async (resolve,reject) => {
                  let docName = proxy.ipaddress + ':' + proxy.port;
                  if(proxy.isSuccess == false)
                  {
                    await firestore.collection(collectionName).doc(docName).delete();
                  }
                  else {
                    firestore.collection(collectionName).doc(docName).set({
                      disable:0,
                      ipaddress: proxy.ipaddress,
                      port : proxy.port,
                      speed: proxy.speed,
                      latency: proxy.latency,
                    }, {merge: true});
                  }
                  resolve();
                });
              })
            ).then(result => resolve());
    } catch (err){
      reject(err);
    }
  });
}

module.exports = DataStore;
