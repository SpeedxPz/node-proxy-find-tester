'use strict'
const request = require('request');
const retry = require('async-retry');


let defultOption = {
  timeout : 20000,
  maxRetry: 3,
  pingTestUrl : "https://platform-sdk.enza.fun/sessions/ping",
  speedTestUrl : "https://shinycolors.enza.fun/assets/fonts/primula-HummingStd-E.woff2?v=d06729741a7c85dd9da625d586c12ddd",
}

let defaultspeedTestOption = {
  timeout : defultOption.timeout,
  maxRetry : defultOption.maxRetry,
  testUrl : defultOption.speedTestUrl,
}

let defaultpingTestOption = {
  timeout : defultOption.timeout,
  maxRetry : defultOption.maxRetry,
  testUrl : defultOption.pingTestUrl,
}

let defaultProxyInfo = {
  ipAddress: "0.0.0.0",
  port: 0,
}

function ProxyTester (){}

ProxyTester.speedTest = async function(ip, port, options = defaultspeedTestOption){
  return new Promise(async function(resolve,reject){
    let proxyInfo = {
      ipAddress: ip,
      port: port,
    }

    let useOption = await checkParameterOrDefault(options, defaultspeedTestOption);
    let retryCount = 0;

    let testResult = await retry(async bail => {
      retryCount++;
      const response = await doSpeedTest(proxyInfo, useOption);
      resolve({
        speed: response,
        retryCount : (retryCount-1),
      });
    },{
      retries: useOption.maxRetry
    }).catch((err) => {
      reject(err);
    });
  });
}
ProxyTester.pingTest = async function(ip, port, options = defaultspeedTestOption){
  return new Promise(async function(resolve,reject){
    let proxyInfo = {
      ipAddress: ip,
      port: port,
    }
    let useOption = await checkParameterOrDefault(options, defaultspeedTestOption);
    let retryCount = 0;

    let testResult = await retry(async bail => {
      retryCount++;
      const response = await doPingTest(proxyInfo, useOption);
      resolve({
        latency: response,
        retryCount : (retryCount-1),
      });
    },{
      retries: useOption.maxRetry
    }).catch((err) => {
      reject(err);
    });
  });
}

const checkParameterOrDefault = async function(options,defaultOptions){
  return new Promise(async function (resolve,reject){
    if(options == null) options = defaultOptions;
    if(options.testUrl == "") if(proxyInfo == null) reject("ENOTESTURLSPECIFIC");
    options.timeout = options.timeout != null? options.timeout : defultOption.timeout;
    options.maxRetry = options.maxRetry != null? options.maxRetry : defultOption.maxRetry;
    resolve(options);
  });
}
const doSpeedTest = async function (proxyInfo, options = defaultspeedTestOption){
  return new Promise(async function(resolve,reject){
    let chunkLength = 0;
    let req = request({
      url: options.testUrl,
      proxy: 'http://' + proxyInfo.ipAddress + ':' + proxyInfo.port,
      time: true,
      timeout: options.timeout,
    },
    function (err,res,imgBuffer){
      if(err == null){
        resolve((chunkLength/(res.timings.end.toFixed(0)/1000)).toFixed(0));
      }
      else {
        reject(err);
      }
    }).on('error', function(err){
        req.abort();
        reject(err);
    }).on('data', function(chunk){
      chunkLength += chunk.length;
    });

    setTimeout(()=>{req.abort();reject('EPROXYTIMEOUT')},options.timeout);



  })
};
const doPingTest = async function (proxyInfo, options = defaultpingTestOption){
  return new Promise(async function(resolve,reject){
    let req = request({
      method: 'HEAD',
      url: options.testUrl,
      proxy: 'http://' + proxyInfo.ipAddress + ':' + proxyInfo.port,
      time: true,
      timeout: options.timeout,
    },function (err,res,imgBuffer){
      if(err == null){
        resolve(res.timings.end.toFixed(0));
      }
      else {
        req.abort();
        reject(err);
      }
    }).on('error', function(err){
        req.abort();
        reject(err);
    });
    setTimeout(()=>{req.abort();reject('EPROXYTIMEOUT')},options.timeout);

  });
}


// This is dirty way to handle unknow ECONNRESET error
// If you know how to fix this please let me know
process.on('uncaughtException',function(err){
  if(err.errno != "ECONNRESET") throw err;
});


module.exports = ProxyTester;
