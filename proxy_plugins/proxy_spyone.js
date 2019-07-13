const fetch = require('node-fetch');

async function GetProxy (){
  return new Promise(function(resolve,reject){
    fetch('http://spys.one/free-proxy-list/JP/',{
    method: "GET",
    })
    .then(res => res.text())
    .then(text => {

      let outputArray = [];
      let decodeScript = text.split("return p}('");
      decodeScript = decodeScript[1].split("',60,60,'");
      let dataSet1 = decodeScript[0];

      decodeScript = text.split("',60,60,'");
      decodeScript = decodeScript[1].split("'.split('\\u005e')");
      let dataSet2 = decodeScript[0].split('\u005e');

      eval(function(p,r,o,x,y,s){y=function(c){return(c<r?'':y(parseInt(c/r)))+((c=c%r)>35?String.fromCharCode(c+29):c.toString(36))};if(!''.replace(/^/,String)){while(o--){s[y(o)]=x[o]||y(o)}x=[function(y){return s[y]}];y=function(){return'\\w+'};o=1};while(o--){if(x[o]){p=p.replace(new RegExp('\\b'+y(o)+'\\b','g'),x[o])}}return p}(dataSet1,60,60,
        dataSet2,0,{}));

      const myRegex = /\d+\.\d+\.\d+\.\d+<script type="text\/javascript">document.write\(\"\<font class=spy2\>\:<\\\/font\>\"\+.*?<\/script>/g;

      var matchArray;
      while ((matchArray = myRegex.exec(text)) !== null) {

        let preAddress = matchArray[0].split('<script type="text/javascript">document.write("<font class=spy2>:<\\/font>"+');
        let prePort = preAddress[1].replace(")</script>","");
        let port = "";
        eval('port = "" + ' + prePort);

        let output = {
          ipaddress : preAddress[0],
          port : port
        };

        outputArray.push(output);
      }
      resolve(outputArray);
    });

  });
}
module.exports = GetProxy;
