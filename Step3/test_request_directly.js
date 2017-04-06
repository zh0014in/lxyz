var webPage = require('webpage');
var page = webPage.create();
var fs = require('fs');

page.settings.XSSAuditingEnabled = false;
page.settings.webSecurityEnabled = false;

page.onConsoleMessage = function (msg) {
  console.log(msg);
};
page.onAlert = function (msg) {

  console.log('ALERT: ' + msg);
  // phantom.exit();
};

// page.onLoadStarted = function () {
//   console.log("load started");
// };

// page.onLoadFinished = function () {
//   console.log("load finished");
// };

var getUrls = [];
var loginurl = "";
var step2Result = fs.read('../Step2/step2results/result_app5_professor.json');
var resultObject = JSON.parse(step2Result);
for (var i = 0; i < resultObject.length; i++) {
  var object = resultObject[i];
  var url = object['url'];
  var loginurl = object['loginurl'];
  var type = object['type'];
  var loginrequired = object['loginrequired'];
  var param = object['param'];

  if (loginrequired && loginurl && type === 'GET') {
    loginurl = loginurl;
    if (param) {
      url = url + "?";
      for (var p in param) {
        if(p == 'logout'){
          // some param is logout
          continue;
        }
        url = url + p + "=" + param[p] + "&";
      }
    }
    getUrls.push(url);
  }
}
console.log(loginurl);
page.open("https://app5.com/www/index.php", function (status) {
  console.log("status: " + status);
  // login
  page.evaluate(function () {

    var arr = document.getElementsByTagName("form");
    var i;
    for (i = 0; i < arr.length; i++) {
      if (arr[i].getAttribute('method') == "post") {
        console.log('enter credentials');
        arr[i].elements["login"].value = "professor";
        arr[i].elements["password"].value = "professor";
        return;
      }
    }
  });

  page.evaluate(function () {

    var arr = document.getElementsByTagName("form");
    var i;

    for (i = 0; i < arr.length; i++) {
      if (arr[i].getAttribute('method') == "post") {
        console.log('login');
        arr[i].submit();
        return;
      }
    }
  });

  setTimeout(function () {

    var count = 0;
    var interval = setInterval(function () {
      console.log(getUrls[count]);
      page.open(getUrls[count], function (status) {
        console.log("status: " + status);
        setTimeout(function () {
          page.sendEvent('mousemove', 90, 90);
        }, 100);
      });
      count++;
      if (count >= getUrls.length) {
        console.log('end.');
        clearInterval(interval);
        phantom.exit();
      }
    }, 1000);

  }, 1000);

});