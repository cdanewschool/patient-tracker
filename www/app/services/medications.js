app.factory
(
	'medicationsService',
	[
	 	'$http','model','medicationsModel','constants','fhir-factory',
	 	function($http,model,medicationsModel,constants,adapter)
	 	{
	 		return {
	 			
	 			init: function(success,error)
	 			{
	 				var self = this;
	 				
	 				this.getStatements().then
					(
						function()
						{
							self.getRecords();
						}
					);
	 			},
	 			
	 			getStatements: function()
	 		    {
	 		    	var url = constants.REST_URL + "medicationstatement/search?patient_id=" + model.patient.id;
                   
	 		    	return $http.get(url,{headers: {'token':model.token}}).then
	 		    	(
	 		    		function(response)
	 		    		{
	 		    			var data = response.data;
	 		    			
	 		    			medicationsModel.statements = adapter.parseMedicationStatements( data );
	 		    			
	 		    			if( constants.DEBUG ) 
	                        	console.log( 'getStatements', data, medicationsModel.statements );
	 		    		}
	 		    	);
	 		    },
	 		    
	 		    getRecords: function( data, success, error )
	 		    {
	 		    	var url = constants.REST_URL + "medicationadministration/search?patient_id=" + model.patient.id;
                 
	 		    	return $http.get(url,{headers: {'token':model.token}}).then
	 		    	(
	 		    		function(response)
	 		    		{
	 		    			var data = response.data;
	 		    			
	 		    			medicationsModel.records = adapter.parseMedicationRecords( data );
			 				
			 				if( constants.DEBUG ) 
			 				    console.log( 'getRecords', data, medicationsModel.records );
	 		    		}
	 		    	);
	 		    	
	 		    	if( constants.DEBUG ) console.log( 'getAdministrations', model.patient.id );
	 		    },
	 		    
	 		    getMedications: function()
	 		    {
	 		       var url = constants.REST_URL + "medication/search?name=" + search;
                   
	 		       return $http.get(url,{headers: {'token':model.token}}).success
	 		       (
	 		    		function(data, status, headers, config)
						{
	 		    			medicationsModel.medications = adapter.parseMedicationStatements( data );
	                        
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
	 		    
	 		    addMedicationRecord: function( data, success, error )
	 		    {
	 		    	var url = constants.REST_URL + "medicationadministration";
	 		    	
	 		    	return $http.put(url,JSON.stringify(data),{headers: {'token':model.token}}).success(success).error(error);
	 		    },
	 		    
	 			addStatement: function( data, success, error )
	 			{
	 				var medication = adapter.getMedicationStatement
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