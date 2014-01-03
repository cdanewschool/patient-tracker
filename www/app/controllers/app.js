/**
 * Core application properties
 */
app.factory
(
	"model",
	[
		function()
		{
			return { 
				
				loggedIn: false,
				
				patient: null,
				
				settings:
					[
					 	{label:"User Profile",target:"profile"},
					 	{label:"Settings"},
					 	{label:"Logout"}
					 ],
				
				trackers:null,
				trackerOptions:null,
				
				selectedTracker:null,
				selectedTrackerId:null,
				selectedTrackerType:null
			};			
		}
	 ]
);

/**
 * Constants for the application
 */
app.factory
(
	"constants",
	function()
	{
		return { 
			DEBUG:true,
			MONTHS_ABBR: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sept","Oct","Nov","Dec"],
			REST_URL: "http://localhost:8888/",
			
			//		code system urls
			LOINC_URL: "http://loinc.org",
			HL7_URL:"http://hl7.org/fhir/",
			SNOMED_URL: "http://snomed.info",
			UNITS_URL: "http://unitsofmeasure.org",
			
			COLOR_PATIENT: "green",
			COLOR_PROVIDER: "blue",
			
			REPORTER_PATIENT: "patient",
			REPORTER_PROVIDER: "provider",
			
			TYPE_MEDICATION: "medication",
			TYPE_TRACKER: "tracker",
			TYPE_VITAL: "vital",
			
			//		simple types
			VITAL_TYPE_BODY_MASS_INDEX: "bodymassindex",
			VITAL_TYPE_BLOOD_PRESSURE: "bloodpressure",
			VITAL_TYPE_BLOOD_PRESSURE_DIASTOLIC: "diastolic",
			VITAL_TYPE_BLOOD_PRESSURE_SYSTOLIC: "systolic",
			VITAL_TYPE_HEIGHT: "height",
			VITAL_TYPE_HEART_RATE: "heartrate",
			VITAL_TYPE_RESPIRATORY_RATE: "respiratoryrate",
			VITAL_TYPE_BODY_TEMPERATURE: "bodytemperature",
			VITAL_TYPE_WEIGHT: "weight",
			
			//		compound types
			VITAL_TYPE_BLOOD_PRESSURE: "bloodpressure"
		};
	}
);

app.controller
(
	'AppCtrl',
	[
	 	'$scope','$rootScope','$routeParams','$location','model','userModel','vitalsModel','vitalsService','medicationsModel','medicationsService','trackersModel','trackersService','navigation','factory','constants',
	 	function($scope,$rootScope,$routeParams,$location,model,userModel,vitalsModel,vitalsService,medicationsModel,medicationsService,trackersModel,trackersService,navigation,factory,constants)
	 	{
	 		$scope.model = model;
	 		$scope.userModel = userModel;
	 		$scope.vitalsModel = vitalsModel;
	 		$scope.vitalsService = vitalsService;
	 		$scope.medicationsModel = medicationsModel;
	 		$scope.medicationsService = medicationsService;
	 		$scope.trackersModel = trackersModel;
	 		$scope.trackersService = trackersService;
	 		$scope.constants = constants;
	 		
	 		$scope.navigation = navigation;
	 		
	 		$scope.status = null;
	 		
	 		/**
	 		 * Set `model.tracker` on routeParams
	 		 * NOTE: Not used
	 		 */
	 		if( $routeParams 
	 			&& $routeParams['tracker_type'] 
	 			&& $routeParams['tracker_id'] )
	 		{
	 			var id = $routeParams['tracker_id'];
	 			
	 			switch( $routeParams['tracker_type'] )
	 			{
	 				case "vital":
	 					for(var t in vitalsModel.statements)
	 						if( vitalsModel.statements[t].id == id )
	 							$scope.model.tracker = vitalsModel.statements[t];
	 					break;
	 					
	 				case "medication":
	 					for(var t in medicationsModel.statements)
	 						if( medicationsModel.statements[t].id == id )
	 							$scope.model.tracker = medicationsModel.statements[t];
	 					break;
	 					
	 				case "tracker":
	 					for(var t in trackersModel.statements)
	 						if( trackersModel.statements[t].id == id )
	 							$scope.model.tracker = trackersModel.statements[t];
	 					break;
	 			}
	 		}
	 		
	 		$rootScope.$on
	 		(
	 			"authenticateSuccess",
	 			function()
	 			{
	 				
	 				$scope.model.patient = factory.patient($scope.userModel.userId);
	 				$scope.model.isLoggedIn = true;
	 				
	 				//	hide popup if any and show home view
	 				$scope.showPopup();
	 				$scope.setLocation('/home');
	 			}
	 		);
	 		
	 		$rootScope.$on
	 		(
	 			"trackerAdded",
	 			function()
	 			{
	 				$scope.setStatus( "Your tracker has been added" );
	 				
	 				$scope.model.selectedTrackerId = null;
	 			}
	 		);
	 		
	 		/**
	 		 * Whenever statement collections in the various sub-system controllers change, update 
	 		 * our `trackers` collection containing all values (so we can list alphabetically, 
	 		 * regardless of section, etc)
	 		 */
	 		$scope.onTrackerUpdate = function(newVal,oldVal)
 			{
 				if( newVal!=oldVal )
 				{
 					var medicationStatements = medicationsModel.statements && medicationsModel.statements.length ? medicationsModel.statements : [];
 					var trackerStatements = trackersModel.statements && trackersModel.statements.length ? trackersModel.statements : [];
 					var vitalStatements = vitalsModel.statements && vitalsModel.statements.length ? vitalsModel.statements : [];
 					
 					$scope.model.trackers = medicationStatements.concat(trackerStatements).concat(vitalStatements);
 					$scope.model.trackerOptions = [{id:null,name:"Select a measure to track"}].concat( $scope.model.trackers );
 					
 					$scope.setStatus();
 				}
 			};
 			
 			$scope.$watchCollection('medicationsModel.statements',$scope.onTrackerUpdate);
	 		$scope.$watchCollection('trackersModel.statements',$scope.onTrackerUpdate);
	 		$scope.$watchCollection('vitalsModel.statements',$scope.onTrackerUpdate);
	 		
	 		/**
	 		 * Initializes the `selectedTracker` property to the object associated with
	 		 * the current id; basically responds to <select> selection in index.html
	 		 */
	 		$scope.$watch
			(
				'model.selectedTrackerId',
				function(newVal,oldVal)
				{
					if( newVal != oldVal )
					{
						model.selectedTracker = null;
						
						for(var t in model.trackers)
						{
							if(model.trackers[t].id==newVal)
							{
								var now = new Date();
								
								var formData = 
								{
									date: now.getFullYear()+"-" + _.str.lpad(now.getMonth()+1,2,'0')+"-" + _.str.lpad(now.getDate(),2,'0'),
									time: _.str.lpad(now.getHours(),2,'0')+":"+_.str.lpad(now.getMinutes(),2,'0')
								};
								
								model.selectedTracker = model.trackers[t];
								
								if( vitalsModel.statements.indexOf(model.selectedTracker)>-1 )
								{
									model.selectedTrackerType = constants.TYPE_VITAL;
									
									formData.components = angular.copy(model.selectedTracker.definition.components);
									
									$scope.vitalsModel.form.add = formData;
								}
								else if( trackersModel.statements.indexOf(model.selectedTracker)>-1 )
								{
									model.selectedTrackerType = constants.TYPE_TRACKER;
									
									_.defaults(formData, {value: 1, unit: model.selectedTracker.definition.unitLabel});
									
									$scope.trackersModel.form.add = formData;
								}
								else if( medicationsModel.statements.indexOf(model.selectedTracker)>-1 )
								{
									model.selectedTrackerType = constants.TYPE_MEDICATION;
									
									_.defaults(formData, {dosageValue: model.selectedTracker.definition.components[0].value,dosageUnit: model.selectedTracker.definition.components[0].unit,routeCode:model.selectedTracker.definition.components[2].value});
									
									$scope.medicationsModel.form.add = formData;
								}
							}
						}
					}
				}
			);
	 		
	 		$scope.deleteStatement = function(tracker)
	 		{
	 			$rootScope.$broadcast('deleteStatement',tracker);
	 		};
	 		
	 		$scope.addStatement = function(tracker)
	 		{
	 			$rootScope.$broadcast('addStatement',tracker);
	 		};
	 		
	 		$scope.navigate = function(id)
	 		{
	 			return $scope.navigation.navigate(id);
	 		};
	 		
	 		$scope.getSectionsForIndex = function (index)
	 		{
	 			return $scope.model.sections[index] ? $scope.model.sections[index].sections : [];
	 		};
	 		
	 		$scope.setLocation = function(path)
	 		{
	 			$scope.navigation.setLocation(path);
	 			$scope.safeApply();
	 		};
	 		
	 		$scope.showPopup = function(id)
	 		{
	 			$scope.navigation.showPopup(id);
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
	 	}
	 ]
);