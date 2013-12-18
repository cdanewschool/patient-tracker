app.factory
(
	'medicationsService',
	[
	 	'$http','model','medicationsModel','constants',
	 	function($http,model,medicationsModel,constants)
	 	{
	 		return {
	 			
	 		    getMedications: function()
	 		    {
	 		       var url = constants.REST_URL + "medication/search?name=" + search;
                   
	 		       return $http.get(url,{headers: {'token':model.token}}).success
	 		       (
	 		    		function(data, status, headers, config)
						{
	 		    			medicationsModel.medications = model.adapter.parseMedicationStatements( data );
	                        
	                        if( constants.DEBUG ) 
	                        	console.log( 'getStatements', data, medicationsModel.medications );
						}
	 		    	)
	 		    	.error
	 		    	(
	 		    		function(data, status, headers, config)
						{
	 		    			if( constants.DEBUG ) 
	                            console.log( "getStatements error", data );
						}	
	 		    	);
                   
	 		       if( constants.DEBUG ) console.log( 'getMedications', search );
	 		    },
	 		    
	 		    getStatements: function( data, success, error )
	 		    {
	 		    	var url = constants.REST_URL + "medicationstatement/search?patient_id=" + model.patient.id;
                   
	 		    	if( constants.DEBUG ) console.log( 'getStatements', model.patient.id );
	 		    	
	 		    	return $http.get(url,{headers: {'token':model.token}}).success(success).error(error);
	 		    },
               
	 		    getAdministrations: function( data, success, error )
	 		    {
	 		    	var url = constants.REST_URL + "medicationadministration/search?patient_id=" + model.patient.id;
                  
	 		    	return $http.get(url,{headers: {'token':model.token}}).success
	 		    	(
	 		    		function(data, status, headers, config)
						{
	 		    			medicationsModel.medicationAdministrations = model.adapter.parseMedicationAdministrations( data );
		 				    
		 				    if( constants.DEBUG ) 
		 				    	console.log( 'getMedicationAdministrations', data, medicationsModel.medicationAdministrations );
						}
	 		    	)
	 		    	.error
	 		    	(
	 		    		function(data, status, headers, config)
						{
	 		    			if( constants.DEBUG ) 
	                            console.log( "getAdministrations error", data );
						}	
	 		    	);
	 		    	
	 		    	if( constants.DEBUG ) console.log( 'getAdministrations', model.patient.id );
	 		    },
	 		    
	 		    addAdministration: function( patientId, medication, date, success, error )
	 		    {
	 		    	var formValues = 
	 		    	{
                       medication: {value:medication,label:"a medication",required:true},
                       date: {value:date,required:false}
	 		    	};
                   
	 		    	for(var field in formValues)
	 		    		if( formValues[field].required 
                           && (formValues[field].value == "" || formValues[field].value == null) ) 
                           return error( null,null,"Please enter " + formValues[field].label );
                   
	 		    	if( constants.DEBUG ) console.log( formValues );
                   
	 		    	var practitionerId = null;
	 		    	var medicationAdministration = model.adapter.getMedicationAdministration
                                                   ( patientId, practitionerId, formValues.medication.value, formValues.date.value );
                   
	 		    	if( constants.DEBUG ) console.log( 'addAdministration', medicationAdministration, JSON.stringify(medicationAdministration) );
                   
	 		    	var url = constants.REST_URL + "medicationadministration";
	 		    	
	 		    	return $http.put(url,JSON.stringify(medicationAdministration),{headers: {'token':model.token}}).success(success).error(error);
	 		    },
	 		    
	 			addStatement: function( data, success, error )
	 			{
	 				var medication = model.adapter.getMedicationStatement
										(
											model.patient.id,
											data.medication,
											data.startTime,data.endTime,
											data.dosageRoute?data.dosageRoute:null,
											data.dosageQuantity?data.dosageQuantity:null,
											data.dosageUnit?data.dosageUnit:null,
											data.dosageFrequency?data.dosageFrequency:null,
											data.dosageRepeatUnit?data.dosageRepeatUnit:null
										);
	 				
					if( constants.DEBUG ) console.log( 'addStatement', medication, JSON.stringify(medication) );
					
					var url = constants.REST_URL + "medicationstatement";
					
					return $http.put(url,JSON.stringify(medication),{headers: {'token':model.token}}).success(success).error(error);
	 			},
	 			
	 			deleteStatement: function( data, success, error )
                {
                    var url = constants.REST_URL + "medicationstatement/delete/@" + data.id;
                    
                    return $http['delete'](url,{headers: {'token':model.token}}).success(success).error(error);
                },
                
                deletAdministration: function( patientId, medicationAdministration, success, error )
                {
                    var url = constants.REST_URL + "medicationadministration/delete/@" + medicationAdministration.id;
                    
                    return $http['delete'](url,{headers: {'token':model.token}}).success(success).error(error);
                },
	 			
	 			showError: function( error )
	 			{
	 				return error;
	 				
	 				if( constants.DEBUG ) console.log( error );
	 			}
	 		};
	 	}	 
	 ]
);