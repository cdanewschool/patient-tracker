app.directive
(
	'confirmDelete', 
	function($parse,vitalsModel)
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
	        			angular.element("#" + attrs.confirmDelete).find("button[data-confirm]").on
	        			(
	        				'click',
	    	        		function(e)
	    	        		{
	    	        			if( angular.element(e.currentTarget).attr('data-confirm') == "true"
	    	        				&& scope.confirmCallback )
	    	        			{
	    	        				scope.confirmCallback();
	    	        			}
	    	        			
	    	        			angular.element("#" + attrs.confirmDelete).find("button[data-confirm]").off('click');
	    	        			angular.element("#" + attrs.confirmDelete).modal('hide');
	    	        		}
	    	        	);
	        			
	        			angular.element("#" + attrs.confirmDelete).modal('show');
	        		}
	        	);
	        }
	    };
	}
);