var observableModule = require("data/observable");
var fetchModule = require("fetch");
var config = require("../../shared/config");
var locationModule = require("location");
var locationManager = locationModule.LocationManager;
var dialogs = require("ui/dialogs");
var platformModule = require("platform");
var frameModule = require("ui/frame");
var count = 0;

var model = new observableModule.Observable({
    helloWorld: "Your Location Services Authorization Status Is Not Yet Determined",
});

exports.loaded = function(args) {
  var page = args.object;
  page.bindingContext = model;
  getLocation();
};


function getLocation() {
  var isEnabled = locationManager.isEnabled();
  console.log("getting Location the " + count++ + " st/th time");
  console.log("locationManager is enabled? ",isEnabled)

  if(isEnabled){
    locationModule.getLocation({ maximumAge: 30000, timeout: 20000 }).then(function (location) {
          model.helloWorld = "Your latitidue is: " + location.latitude +
                             "\nYour longitude is: " + location.longitude;
      }, function (error) {
          console.log("there was an error ",error)
      });

  } else {
    if (platformModule.device.os == 'iOS'){
      // This is the initial call for authroisation.
      requestAuthorisation();
    }
  }
}

function requestAuthorisation() {
  var iosLocationManager = CLLocationManager.alloc().init();
  iosLocationManager.delegate = locationDelegate;
  iosLocationManager.requestWhenInUseAuthorization();
}


function authorisationStatusDenied(){
  model.helloWorld = "There was an error finding your location. Please check " +
                     "your location services settings and reload this app";
}


function getStatus(status) {
  console.log("getting Status")
  var statusString = "";
  switch (status) {
       case CLAuthorizationStatus.kCLAuthorizationStatusNotDetermined:
           statusString = "AuthorizationStatusNotDetermined";
           break;
       case CLAuthorizationStatus.kCLAuthorizationStatusRestricted:
           statusString = "AuthorizationStatusRestricted";
           break;
       case CLAuthorizationStatus.kCLAuthorizationStatusDenied:
           statusString = "AuthorizationStatusDenied";
           break;
       case CLAuthorizationStatus.kCLAuthorizationStatusAuthorized:
           statusString = "AuthorizationStatusAuthorized";
           break;
       case CLAuthorizationStatus.kCLAuthorizationStatusAuthorizedAlways:
           statusString = "AuthorizationStatusAuthorizedAlways";
           break;
       case CLAuthorizationStatus.kCLAuthorizationStatusAuthorizedWhenInUse:
           statusString = "AuthorizationStatusAuthorizedWhenInUse";
           break;
   }
   console.log("Status is: "+statusString);
   return statusString;
}


if (platformModule.device.os == 'iOS'){
   console.log("running");

          var ll;

          ll = (function (_super) {
              __extends(ll, _super);
              function ll() {
                  _super.apply(this, arguments);
              }
              ll.new = function () {
                  return _super.new.call(this);
              };

              ll.prototype.locationManagerDidChangeAuthorizationStatus = function (manager, status) {
                  var s = getStatus(status);
                  if(s == "AuthorizationStatusAuthorizedWhenInUse" || s == "AuthorizationStatusAuthorized" || s == "AuthorizationStatusRestricted"){
                    getLocation();
                  } else if( s == "AuthorizationStatusDenied") {
                    // Tell the user to go update their settings
                    authorisationStatusDenied();
                  } else if ( s == "AuthorizationStatusNotDetermined") {
                    // The user has missed or dodged the dialogue.
                    //setTimeout(requestAuthorisation, 3000);
                  }
              };

              ll.ObjCProtocols = [CLLocationManagerDelegate];
              return ll;
          })(NSObject);

          var locationDelegate = ll.new();

}
