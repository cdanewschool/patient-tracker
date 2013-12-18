var cordova = angular.module
(
	"fsCordova",[]
);

//	http://www.ng-newsletter.com/posts/angular-on-mobile.html
cordova.service
(
	"CordovaService",
	[
	 	"$document","$q",
	 	function($document,$q)
	 	{
	 		var d = $q.defer(),resolved = false;
	 		
	 		this.ready = false;
	 		
	 		document.addEventListener
	 		(
	 			'deviceready',
	 			function()
	 			{
	 				resolved = true;
	 				d.resolve(window.cordova);
	 			}
	 		);
	 		
	 		setTimeout
	 		(
	 			function()
	 			{
	 				if(!resolved)
	 				{
	 					if( window.cordova )
	 						d.resolve(window.cordova);
	 				}
	 			},3000
	 		);
	 	}
	 ]
);
