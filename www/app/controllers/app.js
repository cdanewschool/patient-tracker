app.factory
(
	"model",
	function()
	{
		return { 
			
			adapter: new FHIRAdapter(), 
			loggedIn: false,
			
			//	TODO: move next steps to patient
			nextSteps:
				[
				 	{label:"Take Gentle Chair Yoga Class",completed:true},
				 	{label:"Continue to check blood sugar twice daily - Set a reminder"},
				 	{label:"Tetanus Vaccination"}
				 ],
				 
			patient: null,
			
			pages: 
				[ 
				  { id:"addVitals", options: { role: "dialog", transition: "slidedown" } },
				  { id:"addMedication", options: { role: "dialog", transition: "slidedown" } },
				  { id:"addTracker", options: { role: "dialog", transition: "slidedown" } },
				  { id:"login", options: { role: "dialog", transition: "slidedown" } },
				  { id: "home" },
				  { id: "vitalsError", options: {role: "dialog", transition: "none"} }
				],
			
			settings:
				[
				 	{label:"User Profile",target:"profile"},
				 	{label:"Settings"},
				 	{label:"Logout"}
				 ],
				
			sections: 
				[
				 	{label:"Messages",icon:"iconMessages.png",count:2},
				 	{label:"Appointments",icon:"iconAppointments.png",count:1},
				 	{label:"Medical Records",icon:"iconMedicalRecords.jpg"},
				 	{label:"Immunizations",icon:"iconImmunizations.jpg"},
				 	{
				 		label:"Vital Signs",icon:"iconVitalSigns.jpg",pageId:"vitalsWeight",
				 		sections:
				 			[
				 			 {id:"Weight",label:"Weight"},
				 			 {id:"Bp",label:"Blood Pressure"},
				 			 {id:"HeartRate",label:"Heart Rate"},
				 			 {id:"RespiratoryRate",label:"Respiratory Rate"},
				 			 {id:"Temperature",label:"Temperature"}
				 			 ]
				 	},
				 	{label:"Exercise",icon:"iconExercise.jpg",count:3},
				 	{label:"Nutrition",icon:"iconNutrition.jpg"},
				 	{label:"Educational Resources",icon:"iconEducationalResources.jpg"},
				 	{label:"Medications",icon:"iconMedications.jpg",pageId:"medications",count:2}
				 ],
				 
			title: "HealthBoard"
		};			
	}
);

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
			
			//		simple types
			VITAL_TYPE_BODY_MASS_INDEX: "bodymassindex",
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
	 	'$scope','$rootScope','$routeParams','$location','model','userModel','vitalsModel','vitalsService','medicationsModel','medicationsService','trackersModel','trackersService','navigation','factory',
	 	function($scope,$rootScope,$routeParams,$location,model,userModel,vitalsModel,vitalsService,medicationsModel,medicationsService,trackersModel,trackersService,navigation,factory)
	 	{
	 		$scope.model = model;
	 		$scope.userModel = userModel;
	 		$scope.vitalsModel = vitalsModel;
	 		$scope.vitalsService = vitalsService;
	 		$scope.medicationsModel = medicationsModel;
	 		$scope.medicationsService = medicationsService;
	 		$scope.trackersModel = trackersModel;
	 		$scope.trackersService = trackersService;
	 		
	 		$scope.navigation = navigation;
	 		
	 		console.log( $routeParams )
	 		
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
	 					for(var t in trackerModel.statements)
	 						if( trackerModel.statements[t].id == id )
	 							$scope.model.tracker = trackerModel.statements[t];
	 					break;
	 					
	 				console.log( $scope.model.tracker )
	 			}
	 		}
	 		$rootScope.$on
	 		(
	 			"authenticateSuccess",
	 			function()
	 			{
	 				$scope.model.patient = factory.patient($scope.userModel.userId);
	 				
	 				$scope.model.isLoggedIn = true;
	 				
	 				$scope.showPopup();
	 				$scope.setLocation('/home');
	 			}
	 		);
	 		
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
	 		
	 		$scope.safeApply = function()
			{
				var phase = this.$root.$$phase;
				if( phase == "$apply" || phase == "$digest" ) return;
				
				this.$apply();		
			};
	 	}
	 ]
);