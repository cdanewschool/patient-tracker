app.directive
(
	'bouncer', 
	function(model,navigation,constants)
	{
	    return {
	        restrict : 'A',
	        
	        link : function(scope, element, attrs)
	        {
	        	/**
				  * listen for page change so we can send user 
				  * back to login if not authenticated
				  */
				 angular.element(element).on
				 (
					"pagebeforechange",
					function(e,data)
					{
						if( typeof data.toPage !== "string" )
							return;
						
						var id = data.options.hash ? data.options.hash : data.toPage.substr( data.toPage.lastIndexOf("#") );
						
						if( !id.match(/login|signup/)
							&& !model.loggedIn )
						{
							e.preventDefault();
							
							data.options.changeHash = true;
							data.options.toPage = "#login";
							
							if( constants.DEBUG ) 
								console.log( "Access denied, changing page to " + id );
							
							$.mobile.changePage("#login");
						}
					}
				);
	        }
	    };
	}
);