const fetch = require('node-fetch');
const ProxyAgent = require('simple-proxy-agent');

async function GetProxy (){
  return new Promise(async (resolve,reject) => {

    const proxyResult  = {
      name: "Spyone",
      list: []
    };

    try {
        const fetchResult = await fetch('https://spys.one/free-proxy-list/TH/',{
              method: "GET",
              headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.83 Safari/537.36' },
              agent: new ProxyAgent('http://202.170.126.68:3128', {
                tunnel: true, // If true, will tunnel all HTTPS using CONNECT method
                timeout: 5000, // Time in milli-seconds, to maximum wait for proxy connection to establish
            })
        });

        const rawdata = await fetchResult.text();
        let decodeScript = rawdata.split("return p}('");
        decodeScript = decodeScript[1].split("',");
        const param1 = decodeScript[0];
        decodeScript = decodeScript[1].split(",");
        const param2 = decodeScript[0];
        const param3 = decodeScript[1];
        const param4 = decodeScript[2].split("'")[1];


        eval(function(p,r,o,x,y,s){y=function(c){return(c<r?'':y(parseInt(c/r)))+((c=c%r)>35?String.fromCharCode(c+29):c.toString(36))};if(!''.replace(/^/,String)){while(o--){s[y(o)]=x[o]||y(o)}x=[function(y){return s[y]}];y=function(){return'\\w+'};o=1};while(o--){if(x[o]){p=p.replace(new RegExp('\\b'+y(o)+'\\b','g'),x[o])}}return p}(param1,param2,param3,
            param4.split('\u005e'),0,{}));


        const ipbegin = rawdata.split('\'"><td colspan=1><font class=spy14>');
        ipbegin.splice(0, 1);


        let resultList = ipbegin.map(item => {
            const result = item.split("</td>")[0];
            const resArray = result.split("<script>");
            let address = resArray[0];
            let port = resArray[1];
            port = port.replace("document.write(\":\"+","");
            port = port.replace(")</script></font>","");
            eval('port = "" + ' + port);

            return {
                ipaddress: address,
                port: port
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