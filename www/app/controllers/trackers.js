app.factory
(
	'trackersModel',
	[
		 'model','constants',
		 function(model,constants)
		 {
			 return {
				 
				 displayedTrackerId: null,
				 selectedTrackerId: undefined,	//	tracker id for currently-selected tracker
			 	selectedTracker:undefined,
			 	
		 		//	subset of supported trackers for which the user has data
		 		trackerOptions: []
			 };
		 }
	]
);

app.controller
(
	'TrackersCtrl',
	['$scope', '$rootScope', 'model', 'userModel', 'trackersModel', 'trackersService', 'navigation','constants',
	function($scope, $rootScope, model, userModel, trackersModel, trackersService, navigation, constants)
	{
		//	dependencies
		$scope.applicationModel = model;
		$scope.userModel = userModel;
		$scope.trackersModel = trackersModel;
		$scope.trackersService = trackersService;
		$scope.navigation = navigation;
		
		$scope.status = null;
		
		$rootScope.$on
 		(
 			"authenticateSuccess",
 			function()
 			{
 				$scope.trackersService.getDefinitions().then
				(
					function()
					{
						$scope.getStatements();
					}
				);
 			}
 		);
		
		//	when the selected tracker id changes, update a model value with the corresponding object
		$scope.$watch
		(
			'trackersModel.selectedTrackerId',
			function(newVal,oldVal)
			{
				if( newVal != oldVal )
				{
					for(var t in trackersModel.definitions)
					{
						if(trackersModel.definitions[t].id==newVal)
						{
							trackersModel.selectedTracker = trackersModel.definitions[t];
							
							$scope.safeApply();
						}
					}
				}
			}
		);
		
		$scope.updateTrackers = function(trackerId)
		{
			//	updates `data` prop within trackersModel.trackers containing patient-specific tracker data
			trackersModel.update();
			
			trackerId = trackerId || $scope.trackersModel.displayedTrackerId;
			
			//	refresh tracker if one is displayed
			if( trackerId != null )
				$scope.showTracker( trackerId );
			
			//	update options
			var trackerOptions = [ {label:"None"} ];
			
			for( var i=0; i < $scope.trackersModel.trackerDefinitions.length; i++) 
			{
				var tracker = $scope.trackersModel.trackerDefinitions[i];
				var trackerId = tracker.label;
				var trackerData = $scope.applicationModel.patient.getTracker(trackerId);
				
				if( trackerData.length )
					trackerOptions.push( tracker );
			}
			
			$scope.trackersModel.trackerOptions = trackerOptions;
			$scope.safeApply();
		};
		
		$scope.getStatements = function()
		{
			var data = {};
			
			return $scope.trackersService.getStatements
 			(
 				data,
 				function(data, status, headers, config)
				{
					trackersModel.statements = model.adapter.parseTrackerStatements( data );
	 				
					if( constants.DEBUG ) 
						console.log( "getStatements success", trackersModel.statements );
				},
				function (data, status, headers, config) 
				{
					if( constants.DEBUG ) 
						console.log( "getStatements error" );
				}
 			);
		};
		
		$scope.addStatement = function()
		{
			$scope.setStatus();
 			
			if( !$scope.trackersModel.selectedTracker )
			{
				$scope.setStatus("Please select a tracker");
			}
			
			if( !$scope.status )
			{
				var data = 
				{
					name: $scope.trackersModel.selectedTracker.label,
					code: $scope.trackersModel.selectedTracker.id,
					code_name: $scope.trackersModel.selectedTracker.code_name,
					code_uri: $scope.trackersModel.selectedTracker.code_uri
				};
				
				if( $scope.trackersModel.selectedTracker.items 
					&& $scope.trackersModel.selectedTracker.items.length )
				{
					if( !$scope.trackersModel.selectedTrackerOptionId )
					{
						$scope.setStatus("Please select an option");
					}
					
					if( !$scope.status )
					{
						for(var o in $scope.trackersModel.selectedTracker.items)
						{
							var option = $scope.trackersModel.selectedTracker.items[o];
							
							console.log( $scope.trackersModel.selectedTrackerOptionId, option.id );
							
							if( option.id == $scope.trackersModel.selectedTrackerOptionId )
							{
								data = 
								{
									name: option.label,
									code: option.id,
									code_name: option.code_name,
									code_uri: option.code_uri
								};
								
								break;
							}
						}
					}
				}
			}
			
			if( $scope.status )
			{
				return;
			};
			
			return $scope.trackersService.addStatement
 			(
 				data,
 				function( data, textStatus, jqXHR )
				{
 					$scope.navigation.showPopup();
 					
 					$scope.getStatements();
 					
 					if( constants.DEBUG ) 
 						console.log( "addStatement", data );
 					
 					$scope.safeApply();
				},
				
				function ( jqXHR, textStatus, errorThrown ) 
				{
					if( constants.DEBUG ) 
						console.log( "addStatement error", jqXHR, textStatus, errorThrown );
					
					$scope.showError( errorThrown );
				}
 			);
		};
		
		$scope.deleteStatement = function(trackerStatement)
		{
			var data = {id:trackerStatement.id};
			
			$scope.trackersService.deleteStatement
 			(
 				data,
 				function( data, textStatus, jqXHR )
				{
 					$scope.navigation.showPopup();
 					
 					$scope.getStatements();
 					
 					if( constants.DEBUG ) 
 						console.log( "deleteStatement", data );
 					
 					$scope.safeApply();
				},
				
				function ( jqXHR, textStatus, errorThrown ) 
				{
					if( constants.DEBUG ) 
						console.log( "deleteStatement error", jqXHR, textStatus, errorThrown );
					
					$scope.showError( errorThrown );
				}
 			);
		};
		
		$scope.submit = function()
		{
			$scope.trackersModel.status = null;
			
			$scope.submitQueue = trackersService.submit
			(
				function (data, textStatus, jqXHR)
	 			{
	 				$scope.submitQueue--;

	 				if( $scope.submitQueue == 0 )
	 				{
	 					//	reset date
	 					var today = new Date();
	 					$scope.trackersModel.selectedDay = today.getFullYear() + '-' + (today.getMonth() + 1 < 10 ? '0' : '') + (today.getMonth() + 1) + '-' + (today.getDate() < 10 ? '0' : '') + today.getDate();
	 					
	 					for(var t in trackersModel.trackerDefinitions)
	 					{
	 						$scope.trackersModel.trackerDefinitions[t].value = '';
	 					}
	 					
	 					$scope.navigation.showPopup();
	 					
	 					$scope.loadTrackers();
	 					
	 					if( constants.DEBUG ) console.log( "success" );
	 				};
	 			},
	 			function (jqXHR, textStatus, errorThrown) 
	 			{
	 				if( constants.DEBUG ) 
	 					$scope.showError( errorThrown );
	 			}
			);
		};
		
		/*
		$scope.showTracker = function(trackerId)
		{
			$scope.trackersModel.displayedTrackerId = trackerId;
			$scope.safeApply();
		};
		
		$scope.getTrackerDefinitionByID = function(id)
		{
			for( var i=0; i < trackersModel.trackerDefinitions.length; i++) {
				var tracker = trackersModel.trackerDefinitions[i];
				if( tracker.id == id )
					return tracker;
			}
			
			return null;
		};
		
		$scope.setSelectedTracker = function(id)
		{
			$scope.trackersModel.setSelectedTrackerId = id;
		};
		*/
		
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
