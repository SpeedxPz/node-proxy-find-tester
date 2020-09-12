const fetch = require('node-fetch');

async function GetProxy (){
  return new Promise(async (resolve,reject) => {

    const proxyResult  = {
      name: "proxyScrape",
      list: []
    };

    try {
      const fetchResult = await fetch('https://api.proxyscrape.com/?request=getproxies&proxytype=http&timeout=10000&country=TH&ssl=all&anonymity=all',{
              method: "GET",
          });
      const rawdata = await fetchResult.text();

      let proxyList = rawdata.split("\r\n");
      let resultList = proxyList.map( (item) => {
        let portSplit = item.split(":");

        return {
          ipaddress: portSplit[0],
          port: portSplit[1]
        };

      });
      resultList = resultList.filter( x=> x.ipaddress != "");
      proxyResult.list = resultList;
      resolve(proxyResult);
    } catch(err) {
      console.log("Error occured while retrieving the proxies (" + err + ")");
      resolve(proxyResult);
    }
  });
}

module.exports = GetProxy;