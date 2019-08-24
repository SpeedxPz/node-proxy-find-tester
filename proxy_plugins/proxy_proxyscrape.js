const fetch = require('node-fetch');

async function GetProxy (){
  return new Promise(function(resolve,reject){
    fetch('https://api.proxyscrape.com/?request=getproxies&proxytype=http&timeout=10000&country=JP&ssl=all&anonymity=all',{
    method: "GET",
    })
    .then(res => res.text())
    .then(text => {

      let outputArray = [];
	
	  let proxyArray = text.split("\r\n");
	  
	  proxyArray.forEach( (item) => {
		  let portSplitter = item.split(":");
		  
		  let output = {
			  ipaddress : portSplitter[0],
			  port : portSplitter[1]
			};
		  outputArray.push(output);
	  });

      resolve(outputArray);
    });

  });
}

module.exports = GetProxy;