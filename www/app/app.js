var app = angular.module
(
	"app",
	["fsCordova","ngRoute"],
	
	//	see http://victorblog.com/2012/12/20/make-angularjs-http-service-behave-like-jquery-ajax/
	function($httpProvider)
	{
		$httpProvider.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=utf-8';
		 
		// Override $http service's default transformRequest
		$httpProvider.defaults.transformRequest = [function(data)
		{
			/**
		     * The workhorse; converts an object to x-www-form-urlencoded serialization.
		     * @param {Object} obj
		     * @return {String}
		     */ 
			var param = function(obj)
		    {
				var query = '';
				var name, value, fullSubName, subName, subValue, innerObj, i;
		      
				for(name in obj)
				{
					value = obj[name];
		        
					if(value instanceof Array)
					{
						for(i=0; i<value.length; ++i)
						{
				            subValue = value[i];
				            fullSubName = name + '[' + i + ']';
				            innerObj = {};
				            innerObj[fullSubName] = subValue;
				            query += param(innerObj) + '&';
						}
					}
					else if(value instanceof Object)
					{
						for(subName in value)
						{
				            subValue = value[subName];
				            fullSubName = name + '[' + subName + ']';
				            innerObj = {};
				            innerObj[fullSubName] = subValue;
				            query += param(innerObj) + '&';
						}
					}
			        else if(value !== undefined && value !== null)
			        {
			        	query += encodeURIComponent(name) + '=' + encodeURIComponent(value) + '&';
			        }
				}
				
				return query.length ? query.substr(0, query.length - 1) : query;
		    };
		    
		    return angular.isObject(data) && String(data) !== '[object File]' ? param(data) : data;
		}];
	}
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
			 	/*.when("/vitals",{templateUrl:"partials/vitals/main.html",controller:"VitalsCtrl"})
			 	.when("/vitals/add",{templateUrl:"partials/vitals/add.html",controller:"VitalsCtrl"})
			 	.when("/medications/list",{templateUrl:"partials/medications/list.html",controller:"MedicationsCtrl"})
			 	.when("/medications/log",{templateUrl:"partials/medications/log.html",controller:"MedicationsCtrl"})*/
			 	.otherwise({redirectUrl:"/"});		
	 	}
	 ]
);

document.addEventListener('deviceready',onDeviceReady);