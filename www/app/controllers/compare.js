app.factory
(
	'compareModel',
	[
	 	'model','constants',
	 	function(model,constants)
	 	{
	 		return {
	 			//	list of selectable conditions
	 			//	(see http://localhost:8888/conditiondefinition/search)
	 			definitions:null,
	 			//	previous list indexed by code
	 			definitionsIndexed:null,
	 			minDate:null,
	 			maxDate:null,
	 			//	props representing selected condition
				//	(see popups/add-condition)
	 			selectedConditionId:undefined,
	 			selectedCondition:null,
	 			//	list of suggested trackers for selected condition
	 			selectedConditionTrackers:null
	 		};
	 	}
	]
);

app.controller
(
	'CompareCtrl',
	['$scope', '$rootScope', '$q', '$timeout', 'model', 'compareModel', 'navigation', 'constants',
	function($scope, $rootScope, $q, $timeout, model, compareModel, navigation, constants)
	{
		$scope.status = null;
		$scope.compareModel = compareModel;
		$scope.trackerSelected = false;
		
		$scope.$watchCollection
		(
			'model.trackers',
			function(newVal,oldVal)
			{
				if( newVal != oldVal )
				{
					compareModel.trackers = newVal ? newVal.slice() : null;
					
					angular.forEach
					( 
						compareModel.trackers, 
						function(item) 
						{ 
							item.selected = (item.records!=null && item.records.length>0);
						}
					);
				}
			}
		);
		
		$scope.$watch
		(
			'compareModel.trackers',
			function(newVal,oldVal)
			{
				if( newVal != oldVal )
				{
					$scope.trackerSelected = false;
		 			
		 			angular.forEach
		 			(
		 				compareModel.trackers,
		 				function(tracker)
		 				{
		 					if( tracker.selected )
		 						$scope.trackerSelected = true;
		 				}
		 			);
				}
			},true
		);
		
		$scope.onDatumSelect = function(point)
		{
			var selectedDate = new Date(point.options.x);
			selectedDate.setHours(0,0,0,0);
			
			var matches = new Array();
			var matchesIndexed = {};
			
			angular.forEach
			(
				compareModel.trackerSet.trackers,
				function(tracker)
				{
					angular.forEach
					(
						tracker.records,
						function(record)
						{
							var date = new Date( record.date );
							date.setHours(0,0,0,0);
							
							if( date.getTime() == selectedDate.getTime()
								&& !matchesIndexed[record.code] )
							{
								matches.push( record );
								matchesIndexed[record.code] = 1;
							}
						}
					);
				}
			);
			
			$scope.compareModel.recordsForDate = matches;
			
			$scope.safeApply();
		};
		
 		$scope.viewSelection = function()
 		{
 			var trackerSet = {trackers:new Array()};
 			
 			var minDate = new Date().getTime();;
 			var maxDate = 0;
 			
 			angular.forEach
 			(
 				compareModel.trackers,
 				function(tracker)
 				{
 					if( tracker.selected )
 					{
 						trackerSet.trackers.push( tracker );
 						
 						angular.forEach
 			 			(
 			 				tracker.records,
 			 				function(record)
 			 				{
 			 					minDate = Math.min( record.date, minDate );
 			 					maxDate = Math.max( record.date, maxDate );
 			 				}
 			 			);
 					}
 				}
 			);
 			
 			compareModel.minDate = minDate;
 			compareModel.maxDate = maxDate;
 			
 			compareModel.trackerSet = trackerSet;
 		};
 		
		$scope.setStatus = function(status)
		{
			status = typeof status != 'undefined' ? status : null;
			
			$scope.status = status;
		};
		
		$scope.safeApply = function()
		{
			var phase = this.$root.$$phase;
			if( phase == "$apply" || phase == "$digest" ) return;
			
			this.$apply();		
		};
	}]
);
