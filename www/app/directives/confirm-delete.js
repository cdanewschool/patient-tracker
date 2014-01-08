app.directive
(
	'confirmDelete', 
	function($parse,vitalsModel,navigation)
	{
	    return {
	        restrict : 'A',
	        scope:
	        {
	        	confirmCallback: "&",
	        },
	    
	        link : function(scope, element, attrs)
	        {
	        	angular.element(element).on
	        	(
	        		'click',
	        		function()
	        		{
	        			var modal = navigation.showPopup(attrs.confirmDelete);
	        			
	        			modal.result.then
	        			(
	        				function (confirmed) 
	        				{
	        					if( confirmed 
	        						&& scope.confirmCallback )
	        						scope.confirmCallback();
	        			    }
	        			 );
	        		}
	        	);
	        }
	    };
	}
);