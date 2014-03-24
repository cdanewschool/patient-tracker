var app = angular.module
(
	"app",
	["ngRoute","ngTouch","ui.bootstrap","config"]
);

var onDeviceReady = function() 
{
    angular.bootstrap( document, ['app']);
};

//	allows us to use ng-repeat with a number
//	usage: ng-repeat="n in [] | range:model.mynumber
app.filter
(
	'range', 
	function() 
	{
		return function(input, total) 
		{
			total = parseInt(total);
			
			for (var i=0; i<total; i++)
				input.push(i);
				
			return input;
		};
	}
);

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

document.addEventListener('deviceready', onDeviceReady);