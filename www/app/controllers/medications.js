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
	 			medication: null, 
	 			dosageFrequency: 1, 
	 			dosageQuantity: 1, 
	 			regularity: 1, 
	 			dosageRepeatUnit: model.formOptions.repeatUnits[3].value, 
	 			dosageRoute: model.formOptions.dosageRoutes[ model.formOptions.dosageRoutes.length-1 ]
	 		};
	 		
	 		return model;
	 	}
	 ]
);

app.controller
(
	"MedicationsCtrl",
	[
	 	'$scope','$rootScope','$timeout','model','medicationsModel','userModel','medicationsService','conditionsService','notificationsService','navigation','constants','fhir-factory','utilities',
	 	function($scope,$rootScope,$timeout,model,medicationsModel,userModel,medicationsService,conditionsService,notificationsService,navigation,constants,adapter,utilities)
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
	 			medicationsModel.form.statement.maxDose = 1;
	 			medicationsModel.form.statement.medication = undefined;	//selected medication
	 			medicationsModel.form.statement.search = undefined;		//posted medication search string
	 			
	 			medicationsModel.form.schedule = 
				{
					frequency: 0,
					enabled: true,
					repeatUnits: model.repeatUnits,
					repeatUnit: model.repeatUnits[0].value,
					repeatUnitDetail: []
				};
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
					
					if( !medicationsModel.form.statement.asNeeded )
						required.concat( ["dosageQuantity","dosageUnit","dosageRoute","dosageFrequency","dosageRepeatUnit","maxDose"] );
					
					for(var field in medicationsModel.form.statement)
						if( required.indexOf(field)>-1 && (medicationsModel.form.statement[field] == null || medicationsModel.form.statement[field] == "") ) 
							$scope.setStatus("Please enter a " + field);
				}
				
				if( !$scope.status 
					&& typeof medicationsModel.form.statement['medication'] != "object" )
				{
					$scope.setStatus("Please enter a medication");
				};
				
				var medication = medicationsModel.form.statement['medication'];
				
				var data = 
				{
					id:medication.id,
					name:medication.content.Medication.name.value,
					startTime:medicationsModel.form.statement['startTime'],
					endTime:medicationsModel.form.statement['endTime'],
					asNeeded:medicationsModel.form.statement['asNeeded'],
					dosageQuantity:medicationsModel.form.statement['dosageQuantity'],
					dosageUnit:medicationsModel.form.statement['dosageUnit'],
					dosageRoute:medicationsModel.form.statement['dosageRoute'],
					dosageFrequency:medicationsModel.form.statement['dosageFrequency'],
					dosageRepeatUnit:medicationsModel.form.statement['dosageRepeatUnit'],
					maxDose:medicationsModel.form.statement['maxDose']
				};
				
				data.enableReminders = false;
				
				if( !$scope.status
					&& medicationsModel.form.schedule
					&& medicationsModel.form.schedule.enabled )
				{
					data.enableReminders = true;
					
					angular.forEach
					(
						[
						 	{field:'frequency',message:'how often you\'d like to be reminded'},
							{field:'repeatUnit',message:'how often you\'d like to be reminded'}
						 ],
						function(item)
						{
							if( !$scope.status 
								&& !medicationsModel.form.schedule[item.field] ) 
								$scope.setStatus("Please specify " + item.message);
							
							if( !$scope.status )
								data[item.field] = medicationsModel.form.schedule[item.field];
						}
					);
					
					if( !$scope.status )
					{
						for(var i=0;i<medicationsModel.form.schedule.frequency;i++)
						{
							if( $scope.status )
								break;
							
							if( medicationsModel.form.schedule.repeatUnit == "h"
								&& typeof medicationsModel.form.schedule.repeatUnitDetail[i] != 'number' )
							{
								$scope.setStatus("Please specify when you'd like to be reminded");
							}
							else if( medicationsModel.form.schedule.repeatUnit == "d"
								&& typeof medicationsModel.form.schedule.repeatUnitDetail[i] != 'number' )
							{
								$scope.setStatus("Please specify when you'd like to be reminded");
							}
							else if( medicationsModel.form.schedule.repeatUnit == "wk"
								&& typeof medicationsModel.form.schedule.repeatUnitDetail[i] != 'number'  )
							{
								$scope.setStatus("Please specify when you'd like to be reminded");
							}
						};
					};
				}
				
				if( $scope.status )
					return;
					
				var id = data.id;
				
				$scope.loading = true;
				
	 			return medicationsService.addStatement
	 			(
	 				data,
	 				function(data, status, headers, config)
					{
	 					if( medicationsModel.form.schedule
 	 						&& medicationsModel.form.schedule.enabled )
 	 					{
 	 						notificationsService.add
 	 	 					(
 	 	 						medication.id,
 	 	 						medication.content.Medication.name.value,
 	 	 						medicationsModel.form.schedule.frequency,
 	 	 						medicationsModel.form.schedule.repeatUnit,
 	 	 						medicationsModel.form.schedule.repeatUnitDetail
 	 	 					);
 	 					}
 					
	 					$timeout
	 					( 
	 						function()
	 						{ 
	 							$scope.loading = false; 
	 							navigation.showPopup();					//hide popup
	 							model.tabs['trackers'].active=true; 	//this automatically selects the "My Trackers"
	 						}, 500 
	 					);
	 					
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
	 			
	 		    return medicationsService.deleteStatement
	 		    (
	 		    	data,
                   	function(data, status, headers, config)
                   	{
	 		    		if( medicationStatement.frequency )
	 					{
	 						notificationsService.delete
	 	 					(
	 	 						medicationStatement.code,
	 	 						medicationStatement.frequency
	 	 					);
	 					}
	 		    	  
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
	 		
	 		$scope.searchMedications = function(query)
	 		{
	 			medicationsModel.form.statement.medication = undefined; 
	 			medicationsModel.form.statement.search = undefined;
	 			
	 			$scope.getMedications(query);
	 		};
	 		
	 		$scope.getMedications = function(query)
	 		{
	 			medicationsModel.medications = null;
	 			
	 		    return medicationsService.getMedications
	 		    (
	 		    	query,
	 		    	function(data, status, headers, config)
	 		    	{
	 		    		var meds = data.entries.map
	 		    		(
	 		    			function(d)
	 		    			{
	 		    				var label = _.str.capitalize(d.content.Medication.name.value);
	 		    				
	 		    				if( d.content.Medication.product 
			 		    			&& d.content.Medication.product.ingredient
			 		    			&& d.content.Medication.product.ingredient.length
			 		    			&& d.content.Medication.product.ingredient[0].amount
			 		    			&& d.content.Medication.product.ingredient[0].amount.numerator )
			 		    			label += (" " + d.content.Medication.product.ingredient[0].amount.numerator.value.value + ' ' + d.content.Medication.product.ingredient[0].amount.numerator.units.value);
	 		    				
	 		    				if( d.content.Medication.product 
	 		    					&& d.content.Medication.product.form
	 		    					&& d.content.Medication.product.form.coding 
	 		    					&& d.content.Medication.product.form.coding.length )
	 		    					label += (" (" + _.str.capitalize(d.content.Medication.product.form.coding[0].display.value.toLowerCase()) + ")" );
	 		    				
	 		    				return { label:label, value:d };
	 		    			}
	 		    		);
	 		    		
	 		    		meds = meds.sort( utilities.sortByLabel );
	 		    		
	 		    		medicationsModel.medications = meds;
	 		    		medicationsModel.form.statement.search = query;
	 		    		
	 		    		if( constants.DEBUG ) 
	 		    			console.log( "getMedications", medicationsModel.medications );
	 		    	},
	 		    	
	 		    	function(data, status, headers, config)
	 		    	{
	 		    		if( constants.DEBUG ) 
	 		    			console.log( "getMedications error", data );
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

	 			var data = {};
	 			var taken = medicationsModel.form.add.taken;
 		    	
	 			var required = 
	 				[
	 					{field:'date',message:'a date'},
	 					{field:'time',message:'a time'},
	 					{field:"dosageValue",message:"a dosage value"},
						{field:"dosageUnit",message:"a dosage unit"},
						{field:"routeCode",message:"a route"}
	 				];
				
				angular.forEach
				(
					required,
					function(item)
					{
						if( !$scope.status 
							&& !medicationsModel.form.add[item.field] ) 
							$scope.setStatus("Please specify " + item.message);
						
						if( !$scope.status )
							data[item.field] = medicationsModel.form.add[item.field];
					}
				);
				
				if( constants.DEBUG ) 
 		    		console.log( 'addMedicationRecord',model.selectedTracker );
				
 		    	if( !$scope.status
 		    		&& taken )
 		    	{
 		    		for(var r in medicationsModel.formOptions.dosageRoutes)
 	 		    		if(medicationsModel.formOptions.dosageRoutes[r].value == medicationsModel.form.add.routeCode )
 	 		    			data.routeName = medicationsModel.formOptions.dosageRoutes[r].label;
 		    		
 		    		if( !data.routeName ) 
 	 		    		$scope.setStatus("Please specify a route name");
 		    	}
 		    	
 		    	if( $scope.status )
 		    		return;
 		    	
 		    	var date = new Date( data.date + ' ' + data.time ).toISOString();
 		    	data.comments = medicationsModel.form.add.comments;
				
 		    	var medicationRecord = adapter.getMedicationAdministration( model.patient.id, model.selectedTracker, taken, data.dosageValue, data.dosageUnit, data.routeCode, data.routeName, data.comments, date );
               
 		    	if( constants.DEBUG ) 
 		    		console.log( 'addMedicationRecord', medicationRecord );
 		    	
 		    	$scope.loading = true;
 		    	
				return medicationsService.addMedicationRecord
				(
					medicationRecord,
                    function(data, status, headers, config)
	 		        {
						$timeout( function(){ $scope.loading = false; navigation.showPopup(); }, 500 );
						
                    	medicationsService.getRecords();
    	 				
    	 				$rootScope.$emit("trackerAdded");
    	 				
    	 				if( constants.DEBUG ) 
    	 					console.log( "success" );
    	 				
	 		            if( constants.DEBUG ) 
	 		                console.log( "addMedicationRecord", data );
	 		        },
	 		        function(data, status, headers, config)
	 		        {
	 		        	$scope.loading = false;
	 		        	
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
