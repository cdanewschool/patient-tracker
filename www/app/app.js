var app = angular.module
(
	"app",
	["fsCordova","ngRoute","ui.bootstrap","config"]
);

var onDeviceReady = function()
{
	angular.bootstrap( document, ['app'] );
};

app.config
(
	[
	 	'$locationProvider','$routeProvider',
	 	function($locationProvider,$routeProvider)
	 	{
	 		$locationProvider.html5Mode(false);
	 		$locationProvider.hashPrefix = "!";
			 
	 		$routeProvider
			 	.when("/",{templateUrl:"partials/splash.html"})
			 	.when("/home",{templateUrl:"partials/my_trackers.html"})
			 	.when("/login",{templateUrl:"partials/login.html",controller:"UserCtrl"})
			 	.when("/signup",{templateUrl:"partials/signup.html",controller:"UserCtrl"})
			 	.when("/view/:tracker_type/:tracker_id",{templateUrl:"partials/tracker.html",controller:"AppCtrl"})
			 	.otherwise({redirectUrl:"/"});		
	 	}
	 ]
);

document.addEventListener('deviceready',onDeviceReady);