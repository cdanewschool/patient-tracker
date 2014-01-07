app.factory
(
	'trackersModel',
	[
		 'model','constants',
		 function(model,constants)
		 {
			 return {
				 displayedTrackerId: null,
				 form:{},
				 selectedTrackerId: undefined,	//	tracker id for currently-selected tracker
				 selectedTracker: null,
				 statements: [],
				 //	subset of supported trackers for which the user has data
				 trackerOptions: [],
				 unregisterListener: {}
			 };
		 }
	]
);

app.controller
(
	'TrackersCtrl',
	['$scope', '$rootScope', 'model', 'userModel', 'trackersModel', 'trackersService', 'navigation','constants','fhir-factory',
	function($scope, $rootScope, model, userModel, trackersModel, trackersService, navigation, constants, adapter)
	{
		//	dependencies
		$scope.model = model;
		$scope.userModel = userModel;
		$scope.trackersModel = trackersModel;
		$scope.trackersService = trackersService;
		$scope.navigation = navigation;
		
		$scope.status = null;
		
		trackersModel.unregisterListener['destroy'] = $rootScope.$on
		(
			"destroy",
			function()
			{
				$scope.trackersModel.unregisterListener['authenticate']();
				$scope.trackersModel.unregisterListener['deleteStatement']();
				$scope.trackersModel.unregisterListener['destroy']();
			}
		);
		
		trackersModel.unregisterListener['authenticate'] = $rootScope.$on
 		(
 			"authenticateSuccess",
 			function()
 			{
 				$scope.getDefinitions().then
				(
					function()
					{
						$scope.getStatements();
						$scope.getRecords();
					}
				);
 			}
 		);
		
		trackersModel.unregisterListener['deleteStatement'] = $rootScope.$on
		(
			"deleteStatement",
			function(e,statement)
			{
				if( trackersModel.statements.indexOf(statement)>-1 )
					$scope.deleteStatement(statement);
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
		
		$scope.getDefinitions = function()
		{
			return $scope.trackersService.getDefinitions
			(
				function(data,config,status,headers)
	    		{
					var definitions = new Array();
	 		    	var definitionsIndexed = {};
	 		    	
	 		    	for(var t in data)
	 		    	{
	 		    		var definition = data[t];
	 		    		
	 		    		var label = definition.label;
	 		    		
	 		    		if( definition.unit == "hour" )
	 		    			label = "Time spent " + label;
	 		    		
 		    			definition.label = label;
 		    			
 		    			for(var c in definition.components)
 		    			{
 		    				_.defaults( definition.components[c], definition );
 		    				
 		    				if( definition.components[c].code )
 		    					definitionsIndexed[definition.components[c].code] = definition.components[c];
 		    			}
 		    			
 		    			definitionsIndexed[definition.code] = definition;
 		    			definitions.push( definition );
	 		    	}
	 		    	
	 		    	trackersModel.definitions = definitions;
	 		    	trackersModel.definitionsIndexed = definitionsIndexed;
	 		    	
	 		    	console.log( "getDefinitions success", trackersModel.definitionsIndexed )
	    		},
	    		function (data, status, headers, config) 
				{
					if( constants.DEBUG ) 
						console.log( "getDefinitions error" );
				}
			);
		};
		
		$scope.getStatements = function()
		{
			var data = {};
			
			return $scope.trackersService.getStatements
 			(
 				data,
 				function(data, status, headers, config)
				{
					trackersModel.statements = adapter.parseTrackerStatements( data );
	 				
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
					code: $scope.trackersModel.selectedTracker.code,
					codeName: $scope.trackersModel.selectedTracker.codeName,
					codeURI: $scope.trackersModel.selectedTracker.codeURI
				};
				
				if( $scope.trackersModel.selectedTracker.components 
					&& $scope.trackersModel.selectedTracker.components.length )
				{
					if( !$scope.trackersModel.selectedTrackerOptionId )
					{
						$scope.setStatus("Please select an option");
					}
					
					if( !$scope.status )
					{
						for(var o in $scope.trackersModel.selectedTracker.components)
						{
							var option = $scope.trackersModel.selectedTracker.components[o];
							
							if( option.code == $scope.trackersModel.selectedTrackerOptionId )
							{
								data = 
								{
									name: option.label,
									code: option.code,
									codeName: option.codeName,
									codeURI: option.codeURI
								};
								
								break;
							}
						}
					}
				}
			}
			
			if( $scope.status )
				return;
			
			var tracker = adapter.getTrackerStatement(model.patient.id,data.name,data.code,data.codeName,data.codeURI);
			
			return $scope.trackersService.addStatement
 			(
 				tracker,
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
		
		$scope.getRecords = function()
		{
			var data = {};
			
			trackersService.getRecords
			(
				function(data, status, headers, config)
				{
 					var parseResult = adapter.parseVitalRecords( data );
		 			
 					var records = parseResult.trackers;
		 			records.sort(function(a,b){return a-b;});
		 			
		 			trackersModel.records = records;
		 			
					if( constants.DEBUG ) 
						console.log( "getRecords success", trackersModel.records );
				},
				function(data, status, headers, config)
				{
					if( constants.DEBUG ) 
						console.log( "getRecords error", data.error );
				}
			);
		};
		
		$scope.addRecord = function()
		{
			$scope.setStatus();
			
			var date = trackersModel.form.add.date;
			var time = trackersModel.form.add.time;
			
			if( !date ) $scope.setStatus("Please specify a date");
			
			date = new Date( date + ' ' + time ).toISOString();
			
			var tracker = model.selectedTracker.definition;
			
			console.log('addRecord',tracker,trackersModel.form.add);

			if( $scope.status )
				return;
			
			var values = [trackersModel.form.add.value];
			
			var observation = adapter.getTracker( tracker, values, model.patient.id, date );
			
			if( !observation )
			{
				$scope.setStatus("Misc error");
				return;
			}
			
			trackersService.addRecord
			(
				observation,
				function(data, status, headers, config)
	 			{
	 				$scope.getRecords();
	 				
	 				$rootScope.$emit("trackerAdded");
	 				
	 				if( constants.DEBUG ) console.log( "success" );
	 			},
	 			function(data, status, headers, config)
	 			{
	 				$scope.setStatus( data.error );
	 			}
			);
		};
		
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
				var trackerData = $scope.model.patient.getTracker(trackerId);
				
				if( trackerData.length )
					trackerOptions.push( tracker );
			}
			
			$scope.trackersModel.trackerOptions = trackerOptions;
			$scope.safeApply();
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
