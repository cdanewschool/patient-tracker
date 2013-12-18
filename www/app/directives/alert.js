app.directive('alert', function($parse,navigation)
{
    return {
        restrict : 'A',
        
        link : function(scope, element, attrs)
        {
    		scope.$watch
    		(
    			attrs.ngModel, 
    			function(newVal,oldVal)
    			{
    				if( newVal != oldVal && newVal != false )
    				{
    					navigation.navigate( attrs.id );
    				}
    			}
    		);
    		
    		$(element).bind
    		(
    			{
    				pagehide: function(event, ui)
    				{ 
    					var model = $parse(attrs.ngModel);
						model.assign(scope, false);
						
						scope.$apply();
    				}
    			}
    		);
        }
    };
});