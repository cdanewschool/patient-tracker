app.factory
(
	'medicationsService',
	[
	 	'$http','model','medicationsModel','constants','fhir-factory','utilities','ENV',
	 	function($http,model,medicationsModel,constants,adapter,utilities,ENV)
	 	{
	 		var service = {
	 			
	 			init: function()
	 			{
	 				this.getStatements().then(this.getRecords);
	 			},
	 			
	 			getStatements: function(onSuccess,onError)
	 		    {
	 		    	var url = ENV.API_URL + "medicationstatement/search?patient_id=" + model.patient.id;
                   
	 		    	var result = $http.get(url,{headers: {'token':model.token}}).then
	 		    	(
	 		    		function(response)
	 		    		{
	 		    			var data = response.data;
	 		    			
	 		    			medicationsModel.statements = adapter.parseMedicationStatements( data );
	 		    			
	 		    			service.syncStatements();
	 		    			
	 		    			if( constants.DEBUG ) 
	                        	console.log( 'getStatements', data, medicationsModel.statements );
	 		    		}
	 		    	);
	 		    	
	 		    	if( onSuccess )
						result.success(onSuccess);
					if( onError )
						result.error(onError);
					
					return result;
	 		    },
	 		    
	 		    getRecords: function( data, onSuccess, onError )
	 		    {
	 		    	var url = ENV.API_URL + "medicationadministration/search?patient_id=" + model.patient.id;
                 
	 		    	var result = $http.get(url,{headers: {'token':model.token}}).then
	 		    	(
	 		    		function(response)
	 		    		{
	 		    			var data = response.data;
	 		    			
	 		    			var records = adapter.parseMedicationRecords( data );
	 		    			records.sort( utilities.sortByDate );
	 		    			
	 		    			medicationsModel.records = records;
	 		    			
	 		    			service.syncStatements();
	 		    			
			 				if( constants.DEBUG ) 
			 				    console.log( 'getRecords', data, medicationsModel.records );
	 		    		}
	 		    	);
	 		    	
	 		    	if( constants.DEBUG ) console.log( 'getAdministrations', model.patient.id );
	 		    	
	 		    	if( onSuccess )
						result.success(onSuccess);
					if( onError )
						result.error(onError);
					
					return result;
	 		    },
	 		    
	 		    getMedications: function(onSuccess,onError)
	 		    {
	 		    	var url = ENV.API_URL + "medication/search?name=" + search;
                   
	 		    	var result = $http.get(url,{headers: {'token':model.token}}).success
	 		    	(
	 		    		function(data, status, headers, config)
						{
	 		    			medicationsModel.medications = adapter.parseMedicationStatements( data );
	                        
	                        if( constants.DEBUG ) 
	                        	console.log( 'getStatements', data, medicationsModel.medications );
	                        
		                    if( onSuccess )
		                    	onSuccess( data, status, headers, config );
						}
	 		    	)
	 		    	.error
	 		    	(
	 		    		function(data, status, headers, config)
						{
	 		    			if( constants.DEBUG ) 
	                            console.log( "getStatements error", data );
	 		    			
	 		    			if( onError )
	 		    				onError( data, status, headers, config );
						}	
	 		    	);
                   
	 		    	if( constants.DEBUG ) console.log( 'getMedications', search );
	 		       
	 		    	return result;
	 		    },
	 		    
	 		    addMedicationRecord: function( data, onSuccess, onError )
	 		    {
	 		    	var url = ENV.API_URL + "medicationadministration";
	 		    	
	 		    	var result = $http.put(url,data,{headers: {'token':model.token}});
	 		    	
	 		    	if( onSuccess )
						result.success(onSuccess);
					if( onError )
						result.error(onError);
					
					return result;
	 		    },
	 		    
	 			addStatement: function( data, onSuccess, onError )
	 			{
	 				var medication = adapter.getMedicationStatement
										(
											model.patient.id,
											data.id,
											data.name,
											data.startTime,
											data.endTime,
											data.asNeeded,
											data.dosageRoute?data.dosageRoute:null,
											data.dosageQuantity?data.dosageQuantity:null,
											data.dosageUnit?data.dosageUnit:null,
											data.dosageFrequency?data.dosageFrequency:null,
											data.dosageRepeatUnit?data.dosageRepeatUnit:null,
											data.maxDose?data.maxDose:null,
											data.enableReminders,
											data.frequency,
											data.repeatUnit
										);
	 				
					if( constants.DEBUG ) 
						console.log( 'addStatement', data, medication );
					
					var url = ENV.API_URL + "medicationstatement";
					
					var result = $http.put(url,medication,{headers: {'token':model.token}});
					
					if( onSuccess )
						result.success(onSuccess);
					if( onError )
						result.error(onError);
					
					return result;
	 			},
	 			
	 			deleteStatement: function( data, onSuccess, onError )
                {
                    var url = ENV.API_URL + "medicationstatement/delete/@" + data.id;
                    
                    var result = $http['delete'](url,{headers: {'token':model.token}});
                    
                    if( onSuccess )
						result.success(onSuccess);
					if( onError )
						result.error(onError);
					
					return result;
                },
                
                deletAdministration: function( patientId, medicationAdministration, onSuccess, onError )
                {
                    var url = ENV.API_URL + "medicationadministration/delete/@" + medicationAdministration.id;
                    
                    var result = $http['delete'](url,{headers: {'token':model.token}});
                    
                    if( onSuccess )
						result.success(onSuccess);
					if( onError )
						result.error(onError);
					
					return result;
                },
	 			
	 			getRecordsForTracker: function(tracker)
	 			{
	 				var records = new Array();
	 				
	 				for(var r in medicationsModel.records)
	 					if( medicationsModel.records[r].medicationId == tracker.id )
	 						records.push( medicationsModel.records[r] );
	 				
	 				return records;
	 			},
	 			
	 			getStatementById: function(id)
	 			{
	 				for(var s in medicationsModel.statements)
	 					if( medicationsModel.statements[s].code == id )
	 						return medicationsModel.statements[s];
	 				
	 				return false;
	 			},
	 			
	 			/**
	 			 * Because trackers and the data for them are stored separately, this function is run when either are set
	 			 * and adds two collections to each tracker object, `valueSummary` and `records`. 
	 			 * 
	 			 * `valueSummary` is an object that summarizes all of the tracker's data for convenience, and includes the
	 			 * the following properties: min, max, values (only primitives), and lastValue (displayable label 
	 			 * representing the most-recent value)
	 			 */
	 			syncStatements: function()
	 			{
	 				for(var s in medicationsModel.statements)	//	iterate over trackers for user
	 				{
	 					var statement = medicationsModel.statements[s];
	 					var records = this.getRecordsForTracker(statement);	//	data for tracker
	 					
	 					console.log( records )
	 					var values = new Array();
	 					var valuesFlat = new Array();
	 					var valuesIndexed = new Array();
	 					
	 					angular.forEach	//	iterate over records for tracker
	 					(
	 						records,
	 						function(r)
	 						{
	 							if( r.values
	 								&& r.values.length )
	 							{
	 								//	while most trackers contain only one value, they can contain multiple values
		 							//	so, iterate over values for this record and index them
		 							for(var i=0;i<r.values.length;i++)
		 							{
		 								valuesIndexed[i] = valuesIndexed[i] ? valuesIndexed[i].concat( r.values[i].values ) : r.values[i].values;
		 							}
	 							}
	 							
	 							var vals = r.values.map(function(a){ return a.values[0]; } );
	 							var unit = r.values.map(function(a){ return a.unit; } );
	 							
	 							valuesFlat = values.concat( vals );
	 							values.push( {values:vals,unit:unit[0]} );
	 						}
	 					);
	 					
	 					medicationsModel.statements[s].chartType = constants.CHART_TYPE_SCATTER;
	 					
	 					var lastLabelValues = values.length ? values[0].values.slice( 0, Math.min(1,values.length) ) : new Array();
	 					var lastLabelUnits = values.length ? values[0].unit : null;
	 					
	 					var valueSummary = 
	 					{
	 						min: _.min( valuesFlat ), 
	 						max: _.max( valuesFlat ), 
	 						values: valuesIndexed, 
	 						lastValue: {value:lastLabelValues.join("/"),unit:lastLabelUnits} 
	 					};
	 					
	 					medicationsModel.statements[s].valueSummary = valueSummary;
	 					medicationsModel.statements[s].records = records;
	 				}
	 			}
	 		};
	 		
	 		return service;
	 	}	 
	 ]
);