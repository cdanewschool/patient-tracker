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
	['$scope', '$rootScope', 'model', 'userModel', 'trackersModel', 'trackersService', 'conditionsService', 'navigation','constants','fhir-factory',
	function($scope, $rootScope, model, userModel, trackersModel, trackersService, conditionsService, navigation, constants, adapter)
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
		
		var syncStatements  = function()
		{
			for(var s in trackersModel.statements)
			{
				var records = trackersService.getRecordsForTracker(trackersModel.statements[s]);
				var definition = trackersModel.definitionsIndexed[ trackersModel.statements[s].code ];
				
				var values = new Array();
				var valuesFlat = new Array();
				
				var valuesIndexed = [];
				
				angular.forEach
				(
					records,
					function(r)
					{
						for(var i=0;i<Math.min( definition.valueLabelDepth, r.values.length);i++)
						{
							if( !valuesFlat[i] ) 
								valuesIndexed[i] = r.values[i].values;
							else
								valuesIndexed[i] = valuesIndexed[i].concat( r.values[i].values );
						}
						
						var vals = r.values.map(function(a){ return a.values[0]; } );
						var unit = r.values.map(function(a){ return a.unit; } );
						
						valuesFlat = values.concat( vals );
						values.push( {values:vals,unit:unit[0]} );
					}
				);
				
				var lastLabelValues = [];
				var lastLabelUnits = null;
				
				for( var i=0;i<Math.min(definition.valueLabelDepth,values.length);i++)
				{
					lastLabelValues.push( values[i].values[0] );
					lastLabelUnits = values[i].unit;
				}
				
				var v = {min: _.min( valuesFlat ), max: _.max( valuesFlat ), values: valuesIndexed, lastRecord: records.length ? records[0] : null, lastValue: {value:lastLabelValues.join("/"),unit:lastLabelUnits} };
				
				trackersModel.statements[s].values = v;
			}
		};
		
		$scope.$watch
		(
			'trackersModel.records',
			function(newVal,oldVal)
			{
				if( newVal != oldVal )
					syncStatements();
			},true
		);
		
		$scope.$watch
		(
			'trackersModel.statements',
			function(newVal,oldVal)
			{
				if( newVal != oldVal )
					syncStatements();
			},true
		);
		
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
			
			if( model.selectedCondition 
				&& model.selectedCondition.trackers.indexOf(data.code)>-1 )
				$scope.setStatus( data.name + ' is already being tracked for ' + model.selectedCondition.name );
			
			var code = data.code;
			
			return $scope.trackersService.addStatement
 			(
 				data,
 				function(data, status, headers, config)
				{
 					navigation.showPopup();						//hide popup
 					model.tabs['trackers'].active=true;			//this automatically selects the "My Trackers" tab
 					
 					//	add newly-added tracker to condition statement
 					if( model.selectedCondition )
 					{
 						model.selectedCondition.trackers.push( code );
 						
 	 					conditionsService.updateStatement( model.selectedCondition );
 					}
 					
 					trackersService.getStatements();
 					
 					if( constants.DEBUG ) 
 						console.log( "addStatement", data );
 					
 					$scope.safeApply();
				},
				
				function (data, status, headers, config)
				{
					if( status == 500 )
						$scope.setStatus( "Ooops, it looks like this tracker has already been added!" );
					
					if( constants.DEBUG ) 
						console.log( "addStatement error", data );
				}
 			);
		};
		
		$scope.deleteStatement = function(trackerStatement)
		{
			var data = {id:trackerStatement.id};
			
			$scope.trackersService.deleteStatement
 			(
 				data,
 				function(data, status, headers, config)
				{
 					$scope.navigation.showPopup();
 					
 					$scope.trackersService.getStatements();
 					
 					if( constants.DEBUG ) 
 						console.log( "deleteStatement", data );
 					
 					$scope.safeApply();
				},
				
				function(data, status, headers, config)
				{
					if( constants.DEBUG ) 
						console.log( "deleteStatement error", data );
				}
 			);
		};
		
		$scope.submit = function()
		{
			$scope.trackersModel.status = null;
			
			$scope.submitQueue = trackersService.submit
			(
				function(data, status, headers, config)
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
	 			function(data, status, headers, config)
	 			{
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
			var components = [];
			
			if( !$scope.status )
			{
				for(var c in trackersModel.form.add.components)
				{
					var component = trackersModel.form.add.components[c];
					
					var label = component.label ? component.label : vital.label;
					var value = component.value;
					
					if( (component.type == "range" || component.type == "number") && isNaN(value) )
						$scope.setStatus( label + " must be a number" );
					
					components.push( component );
				}
			}
			
			if( components.length != trackersModel.form.add.components.length )
			{
				$scope.setStatus("Misc error");
				return;
			}
			
			if( $scope.status )
				return;
			
			var observation = adapter.getTracker( tracker, components, trackersModel.form.add.comments, model.patient.id, date );
			
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
