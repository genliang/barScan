// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
var scanApp = angular.module('barScan', ['ionic', 'ngCordova', 'ngCordovaOauth']);

scanApp.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    if(window.cordova && window.cordova.plugins.Keyboard) {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);

      // Don't remove this line unless you know what you are doing. It stops the viewport
      // from snapping when text inputs are focused. Ionic handles this internally for
      // a much nicer keyboard experience.
      cordova.plugins.Keyboard.disableScroll(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
});

scanApp.controller('BarcodeController', function($scope, $cordovaBarcodeScanner, $http, $cordovaOauth){
  var requestToken = "";
  var accessToken = "";

  var clientSecret = "iOcsIEVS1FmJV9a1wcvkALuI";
  var scriptID = "MthX4QQhSpI8h7iQJnCg5pfXmydG7heBS";

  var barcode_scan = ""; 
  var date = new Date();
  date = date.toLocaleString();
  var Google = {
    url: 'https://accounts.google.com/o/oauth2/auth',
    client_id: '351861263188-uulv9ssvl8t2f257teb1vra2e8vfgcc3.apps.googleusercontent.com',
    redirect_uri: 'http://localhost/callback',
    scope: 'https://www.googleapis.com/auth/spreadsheets'
  };
  var url = Google.url+'?client_id='+ Google.client_id + '&response_type=token' +'&redirect_uri=' + Google.redirect_uri + '&scope=' + Google.scope;


  $scope.scanBarcode = function() {
        //$scope.login();
        $cordovaBarcodeScanner.scan().then(function(imageData) {
            barcode_scan = imageData.text;
            alert(barcode_scan);
            $scope.callScriptFunction();
            console.log(typeof(barcode_scan));
            console.log("Barcode Format -> " + imageData.format);
            console.log("Cancelled -> " + imageData.cancelled);
        }, function(error) {
            console.log("An error happened -> " + error);
        });


  };

  $scope.login = function() {
    //To get a response from Google
    var ref = window.open(url, '_blank');
    console.log('window is open');

    
   /*ref.addEventListener('loadstop', function(e) { 
      var url = e.url;
      //var code = /\?access_token=(.+)$/.exec(url);
      console.log(url); // trying to extract the access_token
      if(url.indexOf("token") !== -1){ //found some token
        console.log("Going to extract some token");
        var accessTokenlength = 'access_token='.length;
        var tokenTypelength = 'token_type='.length;
        var expirylength = 'expires_in='.length;
        var accessTokenIndex = url.indexOf('access_token');
        var tokenTypeIndex = url.indexOf('token_type');
        var expiryIndex = url.indexOf('expires_in');
        access_token = url.substring(accessTokenIndex+accessTokenlength, tokenTypeIndex-1);
        var oauth = {
          'access_token': access_token,
          expires_in: expirylength,
          user: Google.client_id
        }
        console.log(access_token);
        ref.close();
      } 
      else{
        console.log("Need to login to google!");
      }
   });*/
   ref.addEventListener('loadstart', function(e) { 
      var url = e.url;
      //var code = /\?access_token=(.+)$/.exec(url);
      console.log(url); // trying to extract the access_token
      if(url.indexOf("accounts") !== -1){ // Login to Google
        console.log("Login to Google");
      } 
      else if (url.indexOf("token") !== -1){ //Some token found
        console.log("Extracting the token...");
        var accessTokenlength = 'access_token='.length;
        var tokenTypelength = 'token_type='.length;
        var expirylength = 'expires_in='.length;
        var accessTokenIndex = url.indexOf('access_token');
        var tokenTypeIndex = url.indexOf('token_type');
        var expiryIndex = url.indexOf('expires_in');
        access_token = url.substring(accessTokenIndex+accessTokenlength, tokenTypeIndex-1);
        var oauth = {
          'access_token': access_token,
          expires_in: expirylength,
          user: Google.client_id
        }
        console.log(access_token);
        ref.close();
      } 
      else{
        console.log("Well, no tokens found, and not logining to Google. Too bad :(");
      }
   });
   ref.addEventListener('exit', function(e){
    if (access_token){
      $http({
          method: 'POST',
          url: 'https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=' + access_token
        }).then(function successCallback(resp){
          console.log('Token Validated!');
          console.log(resp.data);
        }, function errorCallback(resp){
          console.log('Error' + resp.data);
        });
      }
   });
   
  }

  

  $scope.callScriptFunction = function() {
    //var sheetID = "1CxQfeX4C8cdsSs1pxCNnrOu4Ss1y_PXjP1YN1r3KC-M";
    //$http.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';
    $http({
      method: 'POST',
      url: 'https://script.googleapis.com/v1/scripts/' + scriptID + ':run',
      headers: {
        'Authorization' : 'Bearer ' + access_token,
        'Content-Type': 'application/json'
      },
      data: {
        'function': 'setData',
        'parameters': [barcode_scan],
        
      },
      
    }).then(function successCallback(resp){
      console.log('It worked!');
      console.log(resp.data);
    }, function errorCallback(resp){
      console.log(resp.data);
      console.log(access_token)
    });

    /*$http({
      method: 'GET',
      url: 'https://www.googleapis.com/auth/spreadsheets?access_token=' + access_token
    }).then(function successCallback(resp){
      console.log('It worked!');
    }, function errorCallback(resp){
      console.log(resp.statusText);
    });*/
  }
});