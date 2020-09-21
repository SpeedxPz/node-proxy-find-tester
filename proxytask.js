'use strict'
const proxyTester = require('./lib/proxytester.js');
const dataStore = require('./lib/datastore.js');
const fs = require('fs');
const path_module = require('path');

const FIRESTORE_COLLECTION_NAME = process.env.COLLECTION_NAME || 'proxylist';
const TEST_OPTION_MAX_RETRY = process.env.OPTION_MAX_RETRY || 3;
const TEST_OPTION_MAX_TIMEOUT = process.env.OPTION_MAX_TIMEOUT || 20000;
const TEST_OPTION_PING_URL = process.env.OPTION_PING_URL || 'https://platform-sdk.enza.fun/sessions/ping';
const TEST_OPTION_SPEED_URL = process.env.OPTION_SPEED_URL || 'https://shinycolors.enza.fun/assets/fonts/primula-HummingStd-E.woff2?v=d06729741a7c85dd9da625d586c12ddd';


function ProxyTask(){}

function sleep(ms){
  return new Promise(resolve => setTimeout(resolve,ms));
}


ProxyTask.updateProxy = async function(){
  return new Promise(async (resolve,reject) => {
    try{
      console.log('Starting proxy server list update...');
      let existProxyList = await ProxyTask.getExistProxyList();
      console.log("Proxy in database : %d", existProxyList.proxyList.length);
      console.log("Get additional proxies from website...");
      let newProxyList = await loadProxyPlugins();
      console.log("Total new proxy : %d", newProxyList.proxyList.length);

      let inputProxyArray = [
        existProxyList.proxyList,
        newProxyList.proxyList
      ];

      let proxyResult = mergeProxyWithoutDuplicate(inputProxyArray);

      let mergedProxy = {
        proxyList : proxyResult,
      }

      console.log("Total Proxy : %d", mergedProxy.proxyList.length);
      let testResult = await testProxy(mergedProxy);

      console.log('Exist proxy test result [total: %d, tested: %d, success: %d, error: %d]',
        testResult.proxyCount,
        testResult.tested,
        testResult.success,
        testResult.error
      );
      console.log('Updating data to firebase...');
      let updateResult = await dataStore.updateProxy(FIRESTORE_COLLECTION_NAME, testResult.testResult);
      console.log('Proxy update successfully');
      resolve();
    } catch(e)
    {
      if(e.error == null) console.error(e);
      else console.error(e.error);
      reject();
    }
  });
}
ProxyTask.getExistProxyList = async function(){
  return new Promise(async (resolve, reject) => {
    try{
      const docs = await dataStore.getAllProxy(FIRESTORE_COLLECTION_NAME);
      if(docs.length == 0) resolve({proxyList: []});
      const proxyArray = [];
      const result = Promise.all(docs.map(async (doc) => {
        return new Promise(async (resolve,reject) => {
          return resolve(doc.data());
        });
      })).then( (proxyList) => {
        resolve({ proxyList: proxyList });
      });

    } catch (err) {
      reject({ error : err });
    }
  });
}
async function testProxy(proxyList){
  return new Promise(async (resolve,reject) => {
    let proxyResult = {
      proxyCount: proxyList.proxyList.length,
      tested: 0,
      success: 0,
      error: 0,
      testResult: []
    };
    if(proxyList.proxyList.length == 0) resolve(proxyResult);

    const result = Promise.all(proxyList.proxyList.map(async (proxy) => {
      return new Promise(async (resolve,reject) => {

        let resultData = {
          ...proxy,
          isSuccess: false,
          error: null
        }
        let testOption = {
          timeout : TEST_OPTION_MAX_TIMEOUT,
          maxRetry : TEST_OPTION_MAX_RETRY,
          testUrl : TEST_OPTION_PING_URL,
        };
        try{

          proxyResult.tested++;
          let testResult;
          testResult = await proxyTester.pingTest(proxy.ipaddress, proxy.port, testOption);
          resultData.latency = testResult.latency;

          await sleep(1000); //Add some delay to not much early request to Proxy Server

          testOption.testUrl = TEST_OPTION_SPEED_URL;
          testResult = await proxyTester.speedTest(proxy.ipaddress, proxy.port, testOption);
          resultData.speed = testResult.speed;
          resultData.isSuccess = true;
          proxyResult.success++;
          console.log(`[${proxy.ipaddress}:${proxy.port}] Success fully with latency ${resultData.latency} ms`);
          return resolve(resultData);
        } catch(err)
        {
          console.log(`[${proxy.ipaddress}:${proxy.port}] Not reachable or it's discontinued.`);
          resultData.speed = 0;
          resultData.latency = -1;
          resultData.isSuccess = false;
          resultData.error = err;
          proxyResult.error++;
          return resolve(resultData);
        }
      });
    })).then( (testResult) => {
      proxyResult.testResult = testResult;
      resolve(proxyResult);
    });

  });
}
async function loadProxyPlugins() {
  return new Promise(function(resolve,reject) {
    fs.readdir('./proxy_plugins/', function(err, files) {
      let promiseResult = Promise.all(
        files.map(async function(file){
          return new Promise(function(resolve,reject){
            let result = require('./proxy_plugins/' + file)();
            resolve(result);
          });
        })
      ).then(function(result){
        let listarray = result.map((item) => {
          console.log("[" + item.name + "] have " + item.list.length + " proxies.");
          return item.list;
        });
        
        let newArray = mergeProxyWithoutDuplicate(listarray);
        resolve({ proxyList : newArray});
      });
    });
  });
}
function mergeProxyWithoutDuplicate(proxyArray){
  let newArray = [];

  for(var i=0; i<proxyArray.length; i++) {
    for(var j=0; j< proxyArray[i].length;j++){
      let content = proxyArray[i][j];
      let duplicate = newArray.filter( t =>
        t.ipaddress == content.ipaddress &&
        t.port == content.port
      )
      if(duplicate.length == 0) {
        let resultObject = {
          ipaddress: content.ipaddress,
          port: content.port,
          speed: 0,
          latency: -1,
          disable: 0,
        }
        newArray.push(resultObject);
      }
    }
  }
  return newArray;
}




module.exports = ProxyTask;
