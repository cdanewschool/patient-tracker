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
		
		$scope.$watchCollection
		(
			'model.trackers',
			function(newVal,oldVal)
			{
				if( newVal != oldVal )
				{
					compareModel.trackers = newVal ? newVal.slice() : null;
					
					angular.forEach( compareModel.trackers, function(item){ item.selected = true; } );
				}
			}
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
 			
 			for(var i in compareModel.trackers)
 				if( compareModel.trackers[i].selected )
 					trackerSet.trackers.push( compareModel.trackers[i] );
 			
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
