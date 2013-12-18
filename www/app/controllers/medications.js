app.factory
(
	"medicationsModel",
	[
	 	'constants',
	 	function(constants)
	 	{
	 		var model = 
	 		{
	 			formOptions:
	 				{
		 				currentlyTaking: 
	 						[
	 				 			{value:"inactive",label:"No"},
	 				 			{value:"active",label:"Yes"}
	 				 		],
 				 		
 				 		regularities: 
	 						[
	 				 			{value:0,label:"As Needed"},
	 				 			{value:1,label:"Regularly"}
	 				 		],
	 				 	
	 				 	/*http://www.hl7.org/implement/standards/fhir/units-of-time.htm*/
 				 		repeatUnits: 
	 						[
	 				 			{value:"s",label:"second(s)"},
	 				 			{value:"min",label:"minute(s)"},
	 				 			{value:"h",label:"hour(s)"},
	 				 			{value:"d",label:"day(s)"},
	 				 			{value:"wk",label:"week(s)"},
	 				 			{value:"mo",label:"month(s)"},
	 				 			{value:"a",label:"year(s)"}
	 				 		],
	 				 	
	 				 	reminder: 
	 						[
	 				 			{value:"off",label:"Off"},
	 				 			{value:"on",label:"On"}
	 				 		],
		 				
	 				 	/*	see http://www.snomedbrowser.com/Codes/Details/18629005	*/
	 				 	dosageRoutes:
	 				 		[
	 				 		 	{value:"386358000",label:"intravenously"},
	 				 		 	{value:"386353009",label:"opthalmically"},
	 				 		 	{value:"386359008",label:"orally"},
	 				 		 	{value:"406172003",label:"nasally"},
	 				 		 	{value:"386360003",label:"rectally"},
	 				 		 	{value:"431695009",label:"topically"},
	 				 		 	{value:"386363001",label:"vaginally"},
	 				 		 ],
 			 			
 			 			dosageUnits:
 			 				[
 			 				 	{value:"mg",label:"mg"},
 			 				 	{value:"mL",label:"ml"}
 			 				 ]
	 				},
	 			
	 			initialized: false,
	 			medications: [],
	 			medicationAdministrations: []
	 		};
	 		
	 		model.formDefaults = 
	 		{
	 			currentlyTaking: model.formOptions.currentlyTaking[0].value, 
	 			medication: null, 
	 			dosageFrequency: 1, 
	 			dosageQuantity: 1, 
	 			regularity: 1, 
	 			dosageRepeatUnit: model.formOptions.repeatUnits[3].value, 
	 			dosageRoute: model.formOptions.dosageRoutes[ model.formOptions.dosageRoutes.length-1 ], 
	 			reminder: model.formOptions.reminder[0].value
	 		};
	 		
	 		return model;
	 	}
	 ]
);

app.controller
(
	"MedicationsCtrl",
	[
	 	'$scope','$rootScope','model','medicationsModel','userModel','medicationsService','navigation','constants',
	 	function($scope,$rootScope,model,medicationsModel,userModel,medicationsService,navigation,constants)
	 	{
	 		$scope.model = model;
	 		$scope.medicationsModel = medicationsModel;
	 		$scope.medicationsService = medicationsService;
	 		$scope.navigation = navigation;
	 		$scope.userModel = userModel;
	 		
	 		var today = new Date();
	 		today.setHours(0);
	 		today.setMinutes(0);
	 		today.setSeconds(0);
	 		today.setMilliseconds(0);
	 		
	 		$scope.today = new Date( today.getTime() );
	 		$scope.displayedDate = new Date( today.getTime() );
	 		
	 		$scope.status = null;
	 		$scope.form = {};
	 		
	 		$rootScope.$on
	 		(
	 			"authenticateSuccess",
	 			function()
	 			{
	 				$scope.getStatements().then
	 				(
	 					function()
	 					{
	 						$scope.medicationsService.getAdministrations();
	 					}
	 				);
	 			}
	 		);
	 		
	 		$scope.$watch
	 		(
	 			"form.medication",
	 			function(newVal,oldVal)
	 			{
	 				if( newVal != oldVal )
	 				{
	 					var val = newVal;
		 				
		 				if( val 
		 					&& val.content
							&& val.content.Medication
							&& val.content.Medication.product
							&& val.content.Medication.product.ingredient
							&& val.content.Medication.product.ingredient.length 
							&& val.content.Medication.product.ingredient[0].amount 
							&& val.content.Medication.product.ingredient[0].amount.numerator )
						{
							if( val.content.Medication.product.ingredient[0].amount.numerator.value )
							{
								$scope.form.dosageQuantity = parseInt(val.content.Medication.product.ingredient[0].amount.numerator.value.value);
							}
							
							if( val.content.Medication.product.ingredient[0].amount.numerator.units )
							{
								for(var u in medicationsModel.formOptions.dosageUnits)
								{
									if( medicationsModel.formOptions.dosageUnits[u].value == val.content.Medication.product.ingredient[0].amount.numerator.units.value )
									{
										$scope.form.dosageUnit = medicationsModel.formOptions.dosageUnits[u];
									}
								}
							}
							
							$scope.safeApply();
						}
	 				}
	 			}
	 		);
	 		
	 		$scope.init = function()
	 		{
	 			$scope.initForm();
	 		};
	 		
	 		$scope.initForm = function()
	 		{
	 			$scope.form = {};
	 			
	 			for(var v in medicationsModel.formDefaults)
	 				$scope.form[v] = medicationsModel.formDefaults[v];
	 			
	 			$scope.form.dosageRoute = medicationsModel.formOptions.dosageRoutes[5];    //  topically
	 			$scope.form.dosageUnit = medicationsModel.formOptions.dosageUnits[1];
	 			$scope.form.repeatUnit = medicationsModel.formOptions.dosageUnits[1];
	 		};
	 		
	 		$scope.setStatus = function(status)
			{
				status = typeof status != 'undefined' ? status : null;
				
				$scope.status = status;
			};
			
			$scope.getStatements = function()
			{
				var data = {};
				
				return $scope.medicationsService.getStatements
	 			(
	 				data,
	 				function(data, status, headers, config)
					{
 		    			if( constants.DEBUG ) 
                        	console.log( 'getStatements', data, medicationsModel.medications );
 		    			
 		    			medicationsModel.statements = model.adapter.parseMedicationStatements( data );
					},
					function(data, status, headers, config)
					{
 		    			if( constants.DEBUG ) 
                            console.log( "getStatements error", data );
					}
	 			);
			};
			
	 		/**
	 		 * Adds a record representing a medication a patient takes or has taken
	 		 */
	 		$scope.addStatement = function()
	 		{
	 			$scope.setStatus();
	 			
				if( !$scope.status )
				{
					var required = ["medication"];
					
					if( $scope.form.regularity == 1 )
						required.concat( ["dosageQuantity","dosageUnit","dosageRoute","dosageFrequency","dosageRepeatUnit"] );
					
					for(var field in $scope.form)
						if( required.indexOf(field)>-1 && ($scope.form[field] == null || $scope.form[field] == "") ) 
							$scope.setStatus("Please enter a " + field);
				}
				
				if( !$scope.status 
					&& typeof $scope.form['medication'] != "object" )
				{
					$scope.setStatus("Please enter a medication");
				};
				
				if( $scope.status )
				{
					console.log( $scope.status );
					return;
				}
				
				var data = 
				{
					medication:$scope.form['medication'],
					startTime:$scope.form['startTime'],
					endTime:$scope.form['endTime'],
					regularity:$scope.form['regularity'],
					dosageQuantity:$scope.form['dosageQuantity'],
					dosageUnit:$scope.form['dosageUnit'],
					dosageRoute:$scope.form['dosageRoute'],
					dosageFrequency:$scope.form['dosageFrequency'],
					dosageRepeatUnit:$scope.form['dosageRepeatUnit']
				};
				
	 			return $scope.medicationsService.addStatement
	 			(
	 				data,
	 				function( data, textStatus, jqXHR )
					{
	 					$scope.initForm();
	 					
	 					$scope.navigation.showPopup();
	 					
	 					$scope.getStatements();
	 					
	 					if( constants.DEBUG ) 
	 						console.log( "addMedicationStatement", data );
	 					
	 					$scope.safeApply();
					},
					
					function ( jqXHR, textStatus, errorThrown ) 
					{
						if( constants.DEBUG ) 
							console.log( "addMedicationStatement error", jqXHR, textStatus, errorThrown );
						
						$scope.showError( errorThrown );
					}
	 			);
	 		};
	 		
	 		$scope.deleteStatement = function(medicationStatement)
	 		{
	 			var data = {id:medicationStatement.id};
	 			
	 		    //TODO: remove all medicationadministrations as well?
	 			return $scope.medicationsService.deleteStatement
	 		    (
	 		       data,
                   function( data, textStatus, jqXHR )
                   {
                       $scope.getStatements();
                       
                       if( constants.DEBUG ) 
                           console.log( "deleteStatement", data );
                   },
                  
                   function ( jqXHR, textStatus, errorThrown ) 
                   {
                       if( constants.DEBUG ) 
                           console.log( "deleteStatement error", jqXHR, textStatus, errorThrown );
                      
                       $scope.showError( errorThrown );
                   }
              );
	 		};
	 		
	 		$scope.medicationIsTaken = function(displayedDate,medication)
	 		{
	 		    for(var m in $scope.medicationsModel.medicationAdministrations)
	 		    {
	 		        var ma = $scope.medicationsModel.medicationAdministrations[m];
	 		        
	 		        if( ma.medicationId == medication.medicationId
	 		            && ma.startDate.getTime() == displayedDate.getTime() )
	 		        {
	 		           return ma;
	 		        }
	 		    }
	 		    
	 		    return false;
	 		};
	 		
	 		$scope.toggleMedicationTaken = function(medication,dateTaken)
            {
	 		    var medicationAdministration = $scope.medicationIsTaken(dateTaken,medication);
	 		    
	 		    if( medicationAdministration )  //  medication was taken for this date
	 		    {
	 		    	return $scope.medicationsService.deleteAdministration
	 		        (
                        $scope.model.patient.id,
                        medicationAdministration,
                        
                        function( data, textStatus, jqXHR )
                        {
                            $scope.medicationsService.getMedicationAdministrations();
                            
                            if( constants.DEBUG ) 
                                console.log( "deleteMedicationAdministration", data );
                        },
                       
                        function ( jqXHR, textStatus, errorThrown ) 
                        {
                            if( constants.DEBUG ) 
                                console.log( "deleteMedicationAdministration error", jqXHR, textStatus, errorThrown );
                           
                            $scope.showError( errorThrown );
                        }
                   );
	 		    }
	 		    else
	 		    {
	 		    	return $scope.medicationsService.addAdministration
	 		       (
	 		            $scope.model.patient.id,
	                    medication,
	                    dateTaken,
	                    
    	 		        function( data, textStatus, jqXHR )
    	 		        {
	                        $scope.medicationsService.getAdministrations();
                           
    	 		            if( constants.DEBUG ) 
    	 		                console.log( "addMedicationAdministration", data );
    	 		        },
    	 		        
    	 		        function ( jqXHR, textStatus, errorThrown ) 
    	 		        {
    	 		            if( constants.DEBUG ) 
    	 		                console.log( "addMedicationAdministration error", jqXHR, textStatus, errorThrown );
                           
    	 		            $scope.showError( errorThrown );
    	 		        }
	 		       );
	 		    }
            };
	 		
	 		$scope.medicationIsActive = function(medicationStatement)
	 		{
	 		    return medicationStatement.endDate == null || new Date(medicationStatement.endDate.value).getTime() > $scope.displayedDate.getTime();
	 		};
	 		
	 		$scope.updateDate = function( inc )
	 		{
	 		    $scope.displayedDate.setDate( $scope.displayedDate.getDate() + inc );
	 		    $scope.safeApply();
	 		};
	 		
	 		$scope.safeApply = function()
			{
				var phase = this.$root.$$phase;
				if( phase == "$apply" || phase == "$digest" ) return;
				
				this.$apply();		
			};
			
	 		$scope.clear = function()
	 		{
	 			//TODO: clear all of patient's medicationstatements, medicationadministrations
	 		};
	 		
	 		$scope.showError = function( error )
 			{
	 			$scope.status = error;
	 			
 				if( constants.DEBUG ) 
 					console.log( error );
 			};
	 		
	 		$scope.init();
	 	}
	 ]
);