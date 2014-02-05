app.directive
(
	'loadButton',
	function($compile,$parse)
	{
		return {
			restrict:"A",

			link: function(scope,element,attrs)
	        {
				var inactiveText = element.text();
				var activeText = attrs.loadButton != "" ? attrs.loadButton : "Loading";
          	   	
				var update = function(loading)
				{
					element.toggleClass( 'disabled', loading );
					element.text( loading ? activeText : inactiveText );
				};
				
				scope.$watch
				(
					attrs.ngModel,
					function(newVal,oldVal)
					{
						if( newVal != oldVal )
						{
							update(newVal);
						}
					}
          	   	);
				
				update(false);
	        }
		};
	}
);