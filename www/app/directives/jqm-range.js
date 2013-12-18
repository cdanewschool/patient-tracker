app.directive('jqmRange', function($parse,vitalsModel)
{
    return {
        restrict : 'A',
        
        link : function(scope, element, attrs)
        {
        	$(document).on('pageinit',function($scope)
			{
        		$("#" + element[0].id).on
				(
					'change',
					function(e)
					{
						var model = $parse(attrs.ngModel);
						model.assign(scope, $(e.currentTarget).val());
						
						scope.$apply();
					}
				);
			});
        	
        }
    };
});