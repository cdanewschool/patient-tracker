app.factory
(
	'vitalsModel',
	[
		 'model','constants',
		 function(model,constants)
		 {
			 var selectedDay = new Date();	//initially "today"
			 
			 return {
		 		charts: {},
		 		status: null,
		 		selectedVitalId: null,
		 		selectedDay: selectedDay.getFullYear() + '-' + (selectedDay.getMonth() + 1 < 10 ? '0' : '') + (selectedDay.getMonth() + 1) + '-' + (selectedDay.getDate() < 10 ? '0' : '') + selectedDay.getDate(),
				 _vitals: null,
	 			_vitalsCache: {}
			};
		 }
	]
);

app.controller
(
	'VitalsCtrl',
	['$scope', '$rootScope', 'model', 'userModel', 'vitalsModel', 'vitalsService', 'navigation','constants',
	function($scope, $rootScope, model, userModel, vitalsModel, vitalsService, navigation, constants)
	{
		//	dependencies
		$scope.applicationModel = model;
		$scope.userModel = userModel;
		$scope.vitalsModel = vitalsModel;
		$scope.vitalsService = vitalsService;
		$scope.navigation = navigation;
		
		$scope.vitalsModel.unregisterDestroy = $rootScope.$on
		(
			"destroy",
			function()
			{
				$scope.vitalsModel.unregisterAuthenticate();
				$scope.vitalsModel.unregisterDestroy();
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
		
		$rootScope.$on
 		(
 			"authenticateSuccess",
 			function()
 			{
 				$scope.vitalsService.getDefinitions().then
				(
					function()
					{
						$scope.getStatements();
						$scope.vitalsService.load();
					}
				);
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
					vitalsModel.statements = model.adapter.parseVitalStatements( data );
	 				
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
					code: $scope.vitalsModel.selectedVital.id,
					code_name: $scope.vitalsModel.selectedVital.code_name,
					code_uri: $scope.vitalsModel.selectedVital.code_uri
				};
			}
			
			if( $scope.status )
			{
				return;
			};
			
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
		
		$scope.loadVitals = function()
		{
			vitalsService.load
			(
	 			function(data, status, headers, config)	//	success handler
				{
	 				$scope.applicationModel.adapter.parseVitals( data, $scope.applicationModel.patient );
					
					if( constants.DEBUG ) 
						console.log( "onLoadVitalsSuccess", data );
					
					$scope.update();
					$scope.safeApply();
				}
			);
		};
		
		$scope.update = function()
		{
			vitalsService.update();
		};
		
		$scope.submitVitals = function()
		{
			$scope.setStatus();
			
			$scope.submitQueue = vitalsService.submit
			(
				function (data, textStatus, jqXHR)
	 			{
	 				$scope.submitQueue--;
	 				
	 				if( $scope.submitQueue == 0 )
	 				{
	 					//	clear form
	 					//	reset date
	 					var today = new Date();
	 					vitalsModel.selectedDay = today.getFullYear() + '-' + (today.getMonth() + 1 < 10 ? '0' : '') + (today.getMonth() + 1) + '-' + (today.getDate() < 10 ? '0' : '') + today.getDate();
	 					
	 					//	reset vital values
	 					for(var v in vitalsModel.vitalDefinitions)
	 					{
	 						for(var c in vitalsModel.vitalDefinitions[v].components)
	 						{
	 							vitalsModel.vitalDefinitions[v].components[c].value = '';
	 						};
	 					}
	 					
	 					var vital = $scope.getVitalDefinitionByID(vitalsModel.selectedVitalId);
	 					
	 					if(vital)
	 						navigation.navigate('vitals' + vital.domId );
	 					
	 					$scope.loadVitals();
	 					
	 					if( constants.DEBUG ) console.log( "success" );
	 				};
	 			},
	 			function (jqXHR, textStatus, errorThrown) 
	 			{
	 				$scope.showError( errorThrown );
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
