app.factory
(
	'vitalsModel',
	[
	 	 'model','constants',
		 function(model,constants)
		 {
			 var selectedDay = new Date();	//initially "today"
			 
			 return {
				 definitions:null,			//
				 definitionsIndexed:null,
				 definitionOptions:null,
				 form:{},
				 charts: {},
				 records:[],
				 status: null,
				 selectedVitalId: null,
				 selectedDay: selectedDay.getFullYear() + '-' + (selectedDay.getMonth() + 1 < 10 ? '0' : '') + (selectedDay.getMonth() + 1) + '-' + (selectedDay.getDate() < 10 ? '0' : '') + selectedDay.getDate(),
				 statements: [],
				 unregisterListener:{},
				 _vitals: null,
				 _vitalsCache: {}
			};
		 }
	]
);

app.controller
(
	'VitalsCtrl',
	['$scope', '$rootScope', 'model', 'userModel', 'vitalsModel', 'vitalsService', 'navigation','constants','fhir-factory',
	function($scope, $rootScope, model, userModel, vitalsModel, vitalsService, navigation, constants, adapter)
	{
		//	dependencies
		$scope.applicationModel = model;
		$scope.userModel = userModel;
		$scope.vitalsModel = vitalsModel;
		$scope.vitalsService = vitalsService;
		$scope.navigation = navigation;
		
		$scope.status = null;
		
		$scope.vitalsModel.unregisterListener['destroy'] = $rootScope.$on
		(
			"destroy",
			function()
			{
				$scope.vitalsModel.unregisterListener['authenticate']();
				$scope.vitalsModel.unregisterListener['deleteStatement']();
				$scope.vitalsModel.unregisterListener['destroy']();
			}
		);
		
		vitalsModel.unregisterListener['authenticate'] = $rootScope.$on
 		(
 			"authenticateSuccess",
 			function()
 			{
 				$scope.vitalsService.getDefinitions().then
				(
					function()
					{
						$scope.getStatements();
						$scope.getRecords();
					}
				);
 			}
 		);
		
		vitalsModel.unregisterListener['deleteStatement'] = $rootScope.$on
		(
			"deleteStatement",
			function(e,statement)
			{
				if( vitalsModel.statements.indexOf(statement)>-1 )
					$scope.deleteStatement(statement);
			}
		);
		
		$scope.$watch
		(
			'vitalsModel.selectedVitalId',
			function(newVal,oldVal)
			{
				if( newVal != oldVal )
				{
					for(var t in vitalsModel.definitions)
					{
						if(vitalsModel.definitions[t].id==newVal)
						{
							vitalsModel.selectedVital = vitalsModel.definitions[t];
							
							$scope.safeApply();
						}
					}
				}
			}
		);
		
		$scope.getStatements = function()
		{
			var data = {};
			
			return $scope.vitalsService.getStatements
 			(
 				data,
 				function(data, status, headers, config)
				{
					vitalsModel.statements = adapter.parseVitalStatements( data );
	 				
					if( constants.DEBUG ) 
						console.log( "getVitalStatements success", vitalsModel.statements );
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
 			
			if( !$scope.vitalsModel.selectedVital )
			{
				$scope.setStatus("Please select a vital");
			}
			
			if( !$scope.status )
			{
				var data = 
				{
					name: $scope.vitalsModel.selectedVital.label,
					code: $scope.vitalsModel.selectedVital.code,
					codeName: $scope.vitalsModel.selectedVital.codeName,
					codeURI: $scope.vitalsModel.selectedVital.codeURI
				};
			}
			
			if( $scope.status )
				return;
			
			return $scope.vitalsService.addStatement
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
				
				function ( data, status, headers, config ) 
				{
					if( constants.DEBUG ) 
						console.log( "addStatement error", jqXHR, textStatus, errorThrown );
					
					$scope.showError( errorThrown );
				}
 			);
		};
		
		$scope.deleteStatement = function(statement)
		{
			var data = {id:statement.id};
			
			return $scope.vitalsService.deleteStatement
 			(
 				data,
 				function( data, status, headers, config )
				{
 					$scope.navigation.showPopup();
 					
 					$scope.getStatements();
 					
 					if( constants.DEBUG ) 
 						console.log( "deleteStatement", data );
 					
 					$scope.safeApply();
				},
				
				function ( data, status, headers, config ) 
				{
					if( constants.DEBUG ) 
						console.log( "deleteStatement error", jqXHR, textStatus, errorThrown );
					
					$scope.showError( errorThrown );
				}
 			);
		};
		
		$scope.getRecords = function()
		{
			var data = {};
			
			vitalsService.getRecords
			(
				function(data, status, headers, config)
				{
 					var parseResult = adapter.parseVitalRecords( data );
		 			
 					var records = parseResult.vitals;
		 			records.sort(function(a,b){return a-b;});
		 			
		 			vitalsModel.records = records;
		 			
					if( constants.DEBUG ) 
						console.log( "getRecords success", vitalsModel.records );
				},
				function(data, status, headers, config)
				{
					if( constants.DEBUG ) 
						console.log( "getRecords error", data.error );
				}
			);
		};
		
		$scope.update = function()
		{
			vitalsService.update();
		};
		
		$scope.addRecord = function()
		{
			$scope.setStatus();
			
			var date = vitalsModel.form.add.date;
			var time = vitalsModel.form.add.time;
			
			if( !date ) $scope.showStatus("Please specify a date");
			
			date = new Date( date + ' ' + time ).toISOString();
			
			var vital = model.selectedTracker.definition;
			var values = [];
			
			if( !$scope.status )
			{
				for(var c in vitalsModel.form.add.components)
				{
					var component = vitalsModel.form.add.components[c];
					
					var label = component.label ? component.label : vital.label;
					var value = component.value;
					
					if( !$scope.status && value == "" )
						$scope.setStatus( "Please sepcify a " + label );
					
					if( isNaN(value) )
						$scope.setStatus( label + " must be a number" );
					    
					values.push( value );
				}
			}
			
			if( values.length != vitalsModel.form.add.components.length )
			{
				$scope.setStatus("Misc error");
				return;
			}
			
			if( $scope.status )
				return;
			
			var observation = adapter.getVital( vital.id, values[0], values[1], vital.unit, model.patient.id, date );
			
			console.log( vital, observation );
			
			if( !observation )
			{
				$scope.setStatus("Misc error");
				return;
			}
			
			vitalsService.addRecord
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
		
		$scope.getVitalUnit = function( type )
		{
			for(var i=0;i<vitalsModel.vitalDefinitions.length;i++)
				if( vitalsModel.vitalDefinitions[i].type == type )
					return vitalsModel.vitalDefinitions[i].unit;
			
			return null;
		};
		
		$scope.getVital = function( type )
		{
			if( !type ) 
				return vitalsModel.vitals;
			
			if( vitalsModel._vitalsCache[type] != undefined ) 
				return vitalsModel._vitalsCache[type];
			
			var inputType = type;
			
			if( type == constants.VITAL_TYPE_BLOOD_PRESSURE ) 
				type = constants.VITAL_TYPE_BLOOD_PRESSURE_SYSTOLIC;
			
			var vitals = [];
			
			for(var i=0;i<vitalsModel.vitals.length;i++)
				if( vitalsModel.vitals[i].type == type )
					vitals.push( vitalsModel.vitals[i] );
			
			if( inputType == constants.VITAL_TYPE_BLOOD_PRESSURE ) 
			{
				var vitals2 = $scope.getVitals( constants.VITAL_TYPE_BLOOD_PRESSURE_DIASTOLIC );
				
				for(var i=0;i<vitals2.length;i++)
					for(var j=0;j<vitals.length;j++)
						if( vitals[j].date == vitals2[i].date )
							vitals[j].value2 = vitals2[i].value;
			}
			
			//	sort by date
			vitals.sort(function(a,b){return a.date-b.date;});
			
			vitalsModel.vitalsCache[type] = vitals;
			
			return vitals;
		};
		
		$scope.getVitalDefintionByID = function(id)
		{
			for( var i=0; i < vitalsModel.vitalDefinitions.length; i++) {
				var vital = vitalsModel.vitalDefinitions[i];
				if( vital.id == id )
					return vital;
			}
			
			return null;
		};
		
		$scope.showTracker = function(trackerId)
		{
			$scope.vitalsModel.displayedTrackerId = trackerId;
			$scope.safeApply();
		};
		
		$scope.getSubNavClass = function(id)
		{
			return $scope.vitalsModel.selectedVitalId == id ? "ui-btn-active ui-state-persist" : "";
		};
		
		$scope.setSelectedVital = function(id)
		{
			$scope.vitalsModel.selectedVitalId = id;
		};
		
		$scope.getVitalClass = function(vital)
		{
			if( vital.multiline === false ) 
				return "ui-grid-" + 'abcdefghi'.charAt( Math.max(0,vital.components.length-2) );
			
			return "";
		};
		
		$scope.getVitalComponentClass = function(vital,component)
		{
			if( vital.multiline === false ) 
				return "ui-block-" + 'abcdefghi'.charAt( vital.components.indexOf(component) );
			
			return "";
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
