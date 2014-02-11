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
