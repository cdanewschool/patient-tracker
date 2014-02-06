app.factory
(
	"medicationsModel",
	[
	 	'constants',
	 	function(constants)
	 	{
	 		var model = 
	 		{
	 			//	options for select lists in add medication form
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
	 			
	 			medications: [],
	 			records: [],
	 			statements: [],
	 			unregisterListener: {}
	 		};
	 		
	 		model.form = {};
	 		
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
	 	'$scope','$rootScope','model','medicationsModel','userModel','medicationsService','conditionsService','navigation','constants','fhir-factory',
	 	function($scope,$rootScope,model,medicationsModel,userModel,medicationsService,conditionsService,navigation,constants,adapter)
	 	{
	 		$scope.model = model;
	 		$scope.medicationsModel = medicationsModel;
	 		$scope.navigation = navigation;
	 		$scope.userModel = userModel;
	 		
	 		var today = new Date();
	 		today.setHours(0);
	 		today.setMinutes(0);
	 		today.setSeconds(0);
	 		today.setMilliseconds(0);
	 		
	 		//	still used?
	 		$scope.today = new Date( today.getTime() );
	 		$scope.displayedDate = new Date( today.getTime() );
	 		
	 		$scope.status = null;
	 		$scope.loading = false;
	 		
	 		medicationsModel.unregisterListener['destroy'] = $rootScope.$on
			(
				"destroy",
				function()
				{
					medicationsModel.unregisterListener['deleteStatement']();
					medicationsModel.unregisterListener['destroy']();
				}
			);
	 		
	 		medicationsModel.unregisterListener['deleteStatement'] = $rootScope.$on
			(
				"deleteStatement",
				function(e,statement)
				{
					if( medicationsModel.statements.indexOf(statement)>-1 )
						$scope.deleteStatement(statement);
				}
			);
	 		
	 		$scope.$watch
	 		(
	 			"medicationsModel.form.statement.medication",
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
								medicationsModel.form.statement.dosageQuantity = parseInt(val.content.Medication.product.ingredient[0].amount.numerator.value.value);
							}
							
							if( val.content.Medication.product.ingredient[0].amount.numerator.units )
							{
								for(var u in medicationsModel.formOptions.dosageUnits)
								{
									if( medicationsModel.formOptions.dosageUnits[u].value == val.content.Medication.product.ingredient[0].amount.numerator.units.value )
									{
										medicationsModel.form.statement.dosageUnit = medicationsModel.formOptions.dosageUnits[u];
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
	 			if( !medicationsModel.form )
	 				medicationsModel.form = {};
	 			
	 			medicationsModel.form.statement = {};
	 			
	 			for(var v in medicationsModel.formDefaults)
	 				medicationsModel.form.statement[v] = medicationsModel.formDefaults[v];
	 			
	 			medicationsModel.form.statement.dosageRoute = medicationsModel.formOptions.dosageRoutes[5];    //  topically
	 			medicationsModel.form.statement.dosageUnit = medicationsModel.formOptions.dosageUnits[1];
	 			medicationsModel.form.statement.repeatUnit = medicationsModel.formOptions.dosageUnits[1];
	 		};
	 		
	 		$scope.init();
	 		
	 		/**
	 		 * Adds a record representing a medication a patient takes or has taken
	 		 */
	 		$scope.addStatement = function()
	 		{
	 			$scope.setStatus();
	 			
				if( !$scope.status )
				{
					var required = ["medication"];
					
					if( medicationsModel.form.statement.regularity == 1 )
						required.concat( ["dosageQuantity","dosageUnit","dosageRoute","dosageFrequency","dosageRepeatUnit"] );
					
					for(var field in medicationsModel.form.statement)
						if( required.indexOf(field)>-1 && (medicationsModel.form.statement[field] == null || medicationsModel.form.statement[field] == "") ) 
							$scope.setStatus("Please enter a " + field);
				}
				
				if( !$scope.status 
					&& typeof medicationsModel.form.statement['medication'] != "object" )
				{
					$scope.setStatus("Please enter a medication");
				};
				
				if( $scope.status )
				{
					console.log( $scope.status );
					return;
				}
				
				var medication = medicationsModel.form.statement['medication'];
				
				var data = 
				{
					id:medication.id,
					name:medication.content.Medication.name.value,
					startTime:medicationsModel.form.statement['startTime'],
					endTime:medicationsModel.form.statement['endTime'],
					regularity:medicationsModel.form.statement['regularity'],
					dosageQuantity:medicationsModel.form.statement['dosageQuantity'],
					dosageUnit:medicationsModel.form.statement['dosageUnit'],
					dosageRoute:medicationsModel.form.statement['dosageRoute'],
					dosageFrequency:medicationsModel.form.statement['dosageFrequency'],
					dosageRepeatUnit:medicationsModel.form.statement['dosageRepeatUnit']
				};
				
				var id = data.id;
				
				$scope.loading = true;
				
	 			return medicationsService.addStatement
	 			(
	 				data,
	 				function(data, status, headers, config)
					{
	 					$timeout( function(){ $scope.loading = false; navigation.showPopup(); }, 500 ); 
	 					
	 					//	add newly-added tracker to condition statement
	 					if( model.selectedCondition && model.selectedCondition != constants.CONDITION_ALL)
	 					{
	 						model.selectedCondition.trackers.push( id );
	 						
	 	 					conditionsService.updateStatement( model.selectedCondition );
	 					}
	 					
	 					medicationsService.getStatements();
	 					
	 					if( constants.DEBUG ) 
	 						console.log( "addMedicationStatement", data );
	 					
	 					$scope.safeApply();
					},
					
					function(data, status, headers, config)
					{
						$scope.loading = false;
						
						if( status == 500 )
							$scope.setStatus( "Ooops, it looks like this medication has already been added!" );
						
						if( constants.DEBUG ) 
							console.log( "addMedicationStatement error", data );
					}
	 			);
	 		};
	 		
	 		$scope.deleteStatement = function(medicationStatement)
	 		{
	 			var data = {id:medicationStatement.id};
	 			
	 		    //TODO: remove all medicationadministrations as well?
	 			return medicationsService.deleteStatement
	 		    (
	 		       data,
                   function(data, status, headers, config)
                   {
                       medicationsService.getStatements();
                       
                       if( constants.DEBUG ) 
                           console.log( "deleteStatement", data );
                   },
                  
                   function(data, status, headers, config)
                   {
                       if( constants.DEBUG ) 
                           console.log( "deleteStatement error", data );
                   }
              );
	 		};
	 		
	 		$scope.medicationIsTaken = function(displayedDate,medication)
	 		{
	 		    for(var m in medicationsModel.records)
	 		    {
	 		        var ma = medicationsModel.records[m];
	 		        
	 		        if( ma.medicationId == medication.medicationId
	 		            && ma.startDate.getTime() == displayedDate.getTime() )
	 		        {
	 		           return ma;
	 		        }
	 		    }
	 		    
	 		    return false;
	 		};
	 		
	 		$scope.addRecord = function()
            {
	 			$scope.setStatus();
				
				var date = medicationsModel.form.add.date;
				var time = medicationsModel.form.add.time;
				
				if( !date ) 
					$scope.setStatus("Please specify a date");
				
				date = new Date( date + ' ' + time ).toISOString();
				
 		    	if( constants.DEBUG ) 
 		    		console.log( 'addMedicationRecord',model.selectedTracker );
 		    	
 		    	var routeName = null;
		    	
 		    	if( !$scope.status )
 		    	{
 		    		for(var r in medicationsModel.formOptions.dosageRoutes)
 	 		    		if(medicationsModel.formOptions.dosageRoutes[r].value == medicationsModel.form.add.routeCode )
 	 		    			routeName = medicationsModel.formOptions.dosageRoutes[r].label;
 		    	}
 		    	
 		    	if( !routeName ) 
 		    		$scope.setStatus("Please specify a route name");
 		    	
 		    	if( $scope.status )
 		    		return;
 		    	
 		    	var medicationRecord = adapter.getMedicationAdministration( model.patient.id, null, model.selectedTracker, medicationsModel.form.add.dosageValue, medicationsModel.form.add.dosageUnit, medicationsModel.form.add.routeCode, routeName, date );
               
 		    	if( constants.DEBUG ) 
 		    		console.log( 'addMedicationRecord', medicationRecord );
 		    	
				return medicationsService.addMedicationRecord
				(
					medicationRecord,
                    function(data, status, headers, config)
	 		        {
                    	medicationsService.getRecords();
    	 				
    	 				$rootScope.$emit("trackerAdded");
    	 				
    	 				if( constants.DEBUG ) console.log( "success" );
    	 				
	 		            if( constants.DEBUG ) 
	 		                console.log( "addMedicationRecord", data );
	 		        },
	 		        function(data, status, headers, config)
	 		        {
	 		            if( constants.DEBUG ) 
	 		                console.log( "addMedicationRecord error", data.error );
	                    
	 		            $scope.setStatus(data.error);
	 		        }
				);
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
	 		
	 		$scope.setStatus = function(status)
			{
				status = typeof status != 'undefined' ? status : null;
				
				$scope.status = status;
			};
	 	}
	 ]
);