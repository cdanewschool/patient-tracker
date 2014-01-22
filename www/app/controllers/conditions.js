app.factory
(
	'conditionsModel',
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
	'ConditionsCtrl',
	['$scope', '$rootScope', '$q', 'model', 'userModel', 'vitalsService', 'trackersService', 'medicationsService', 'conditionsModel', 'conditionsService', 'fhir-factory', 'utilities', 'navigation', 'constants',
	function($scope, $rootScope, $q, model, userModel, vitalsService, trackersService, medicationsService, conditionsModel, conditionsService, adapter, utilities, navigation, constants)
	{
		$scope.conditionsModel = conditionsModel;
		$scope.userModel = userModel;
		$scope.navigation = navigation;
		
		$scope.status = null;
		
		//	update `selectedCondition/selectedConditionTrackers` when `selectedConditionId` changes
		$scope.$watch
		(
			'conditionsModel.selectedConditionId',
			function(newVal,oldVal)
			{
				conditionsModel.selectedCondition = null;
				
				if( newVal != oldVal 
					&& newVal != null )
				{
					var def = conditionsModel.definitionsIndexed[newVal];
					var trackers = def.medications.concat(def.vitals).concat(def.customs);
					
					for(var t in trackers)
						trackers[t].selected = true;
					
					conditionsModel.selectedCondition = def;
					conditionsModel.selectedConditionTrackers = trackers.sort(utilities.sortByLabel);
				}
			}
		);
		
		/**
		 * Adds a condition for a patient (the user)
		 * Method named 'addStatement' for consistency with other sub-systems, though created resource is Condition
		 * 
		 *  (see http://localhost:8888/condition/search for all conditions)
		 */
		$scope.addStatement = function()
		{
			//	clear error state
			$scope.setStatus();
 			
			if( !conditionsModel.selectedCondition )
			{
				$scope.setStatus("Please select a condition");
			}
			
			//	compose list of suggested trackers user has elected to track
			var trackers = [];
			
			for(var t in conditionsModel.selectedConditionTrackers)
				if( conditionsModel.selectedConditionTrackers[t].selected )
					trackers.push( conditionsModel.selectedConditionTrackers[t] );
			
			//	exit if any errors
			if( $scope.status )
				return;
			
			return conditionsService.addStatement
 			(
 				conditionsModel.selectedCondition,
 				trackers,
 				function(data, status, headers, config)		//	success
				{
 					var code = conditionsModel.selectedConditionId;
 					
 					//	hide popup
 					navigation.showPopup();
 					
 					// 	clear `selectedDefinitionId` (effectively re-initing select list)
	 				conditionsModel.selectedConditionId = undefined;
	 				
 					//	add "statement" for each selected tracker
 					var chain = $q.defer();
 					
 					var promises = [];
 					
 					angular.forEach
 					( 
 						trackers, 
 						function(tracker)
 						{
 							if( tracker.type == "vital" )
 	 							promises.push( vitalsService.addStatement( {name:tracker.label,code:tracker.code,codeName:tracker.codeName,codeURI:tracker.codeURI} ) );
 	 						else if( tracker.type == "custom" )
 	 							promises.push( trackersService.addStatement( {name:tracker.label,code:tracker.code,codeName:tracker.codeName,codeURI:tracker.codeURI} ) );
 	 						else if( tracker.type == "medication" )
 	 							promises.push( medicationsService.addStatement( {id:tracker.id,name:tracker.label} ) );
 						}
 					);
 					
 					$q.all(promises).then
 					( 
 						function()
 						{
 							//	once all statements have been added, reload them
 							//	NOTE: as a performance optimization, various addStatement calls could push 
 							//	locally on success instead of reloading everything
 							medicationsService.getStatements();
 							trackersService.getStatements();
 							vitalsService.getStatements();
 							
 							conditionsService.getStatements().then
 							(
 								function()
 								{
 									angular.forEach
 									(
 										conditionsModel.statements,
 										function(statement)
 										{
 											if( statement.code == code )
 											{
 												model.selectedCondition = statement;
 											}
 										}
 									);
 								}
 							);
 							
 							chain.resolve();
 						}
 					);
 					
 					if( constants.DEBUG ) 
 						console.log( "addStatement", data );
				},
				
				function( data, status, headers, config ) 
				{
					if( status == 500 )
						$scope.setStatus( data );
					
					if( constants.DEBUG ) 
						console.log( "addStatement error", data, status );
				}
 			);
		};
 		
 		$scope.onAddConditionDismiss = function()
 		{
 			conditionsModel.selectedConditionId = undefined;
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
