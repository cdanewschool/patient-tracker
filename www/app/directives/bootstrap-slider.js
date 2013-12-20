app.directive
(
	'bootstrapSlider',
	function($parse)
	{
		return {
			restrict:"A",

			link:function(scope,element,attrs)
			{
				var options = 
				{
					handle:'square',
					min:1,
					tooltip:'show',
					value:$parse(attrs.ngModel)(scope)
				};
				
				if( attrs.bootstrapSliderMax )
				{
					options.max = attrs.bootstrapSliderMax;
				}
				
				if( attrs.bootstrapSliderUnits )
				{
					options.formater = function(a)
					{
						return a + ' ' + $parse(attrs.bootstrapSliderUnits)(scope);
					};
				}
				
				angular.element(element).slider(options);
				
				angular.element(element).on
				(
					'slideStop', 
					function (e) 
					{
						var model = $parse(attrs.ngModel);
						model.assign(scope, e.value);
						
						scope.$apply();
					}
				);
			}
		};
	}
);