//	http://augustl.com/blog/2013/popups_in_angular/
app.directive
(
	'compareOverlay',
	function($filter)
	{
		return {
			restrict:'A',
			
			controller: 
				[ 
				  '$scope','$compile',
				  function( $scope,$compile ) 
				  {
					  $scope.hide = function()
					  {
						  console.log('hide',$scope.popup);
						  
						  if( $('.compare-overlay') )
							  $('.compare-overlay').remove();
					  };
					  
					  $scope.show = function(element)
					  {
						  var popupTemplate = '<div ng-include="\'popups/compare-overlay.html\'"></div>';
						  var popupScope = $scope.$new();
						  var popupLinker = $compile(popupTemplate);
						  
						  angular.element(element).append( popupLinker(popupScope) );
						  
						  popupScope.$on
						  (
								  "close", 
								  function () 
								  {
									  $scope.hide();
									  
									  popupScope.$destroy();
								  }
						  );
					  };
				  }
				 ],
				
			link:function(scope,element,attrs)
			{
				scope.$watch
				(
					'compareModel.recordsForDate',
					function(newVal,oldVal)
					{
						if( newVal == oldVal ) return;
						
						var rows = new Array();
						var date;
						var data = [];
						
						angular.forEach
						(
							newVal,
							function(record)
							{
								var unit = record.unitLabel;
								var values = new Array();
								
								if( !scope.date ) 
									scope.date = $filter('date')(new Date( record.date ),'mediumDate');
								
								angular.forEach
								(
									record.values,
									function(value)
									{
										values.push( value.values[0] );
									}
								);
								
								data.push( {name:record.name,values:values,unit:unit });
							}
						);
						
						scope.data = data;
						
						scope.show(element);
					}
				);
			}
		};
	}
);
