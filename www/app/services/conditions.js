app.factory
(
	'conditionsService',
	[
	 	'$http','$q','$timeout','model','conditionsModel','trackersModel','vitalsModel','medicationsModel','constants','fhir-factory',
	 	function($http,$q,$timeout,model,conditionsModel,trackersModel,vitalsModel,medicationsModel,constants,adapter)
	 	{
	 		return {
	 			
	 			init: function()
	 			{
	 				return this.getDefinitions().then(this.getStatements);
	 			},
	 			
	 			getDefinitions: function(success,error)
	 		    {
	 				var url = constants.REST_URL + "conditiondefinition/search";
		 			
		 		   	var result = $http.get(url,{headers:{'token':model.token}}).then
		 		    (
		 		    	function(response)
		 		    	{
		 		    		var data = response.data;
		 		    		
		 		    		var definitions = new Array();
			 		    	var definitionsIndexed = {};
			 		    	
			 		    	for(var t in data)
			 		    	{
			 		    		var definition = data[t];
		 		    			
			 		    		var medications = [];
			 		    		
			 		    		for(var m in definition.medications)
			 		    		{
			 		    			var medication = definition.medications[m];
			 		    			
			 		    			medications.push
			 		    			( 
			 		    				{
			 		    					id:medication.entry.id, 
			 		    					code: medication.entry.content.Medication.code.coding[0].code.value,
			 		    					codeName: medication.entry.content.Medication.code.coding[0].display.value,
			 		    					codeURI: medication.entry.content.Medication.code.coding[0].system.value,
			 		    					label:medication.entry.content.Medication.name.value, type:'medication'
			 		    				}
			 		    			);
			 		    		}
			 		    		
			 		    		definition.medications = medications;
		 		    			
		 		    			definitionsIndexed[definition.code] = definition;
		 		    			definitions.push( definition );
			 		    	}
			 		    	
			 		    	conditionsModel.definitions = definitions;
			 		    	conditionsModel.definitionsIndexed = definitionsIndexed;
			 		    	
			 		    	if( constants.DEBUG ) 
			 		    		console.log( "getDefinitions success", conditionsModel.definitionsIndexed );
		 		    	}
		 		    );
		 		    
		 		    if( success )
						result.success(success);
					if( error )
						result.error(error);
						
					return result;
	 		    },
	 		    
	 		    getStatements: function(success,error)
	 		    {
	 		    	var url = constants.REST_URL + "condition/search?subject=" + model.patient.id;
	 				
	 		    	return $http.get(url,{headers:{'token':model.token}}).then
	 		    	(
	 		    		function(response)
	 		    		{
	 		    			var data = response.data;
	 		    			
	 		    			conditionsModel.statements = adapter.parseConditions( data );
	 		 				
	 						if( constants.DEBUG ) 
	 							console.log( "getStatements success", conditionsModel.statements );
	 		    		}
	 		    	);
	 		    },
	 		    
	 		    addStatement: function( conditionDefinition, trackers, success, error )
	 			{
	 		    	var now = new Date().toISOString();
	 				var condition = adapter.getCondition( conditionDefinition, trackers, model.patient.id, now );
	 				
					if( constants.DEBUG ) 
						console.log( 'addStatement', condition );
					
					var url = constants.REST_URL + "condition";
					
					var result = $http.put(url,condition,{headers: {'token':model.token}});
					
					if( success )
						result.success(success);
					if( error )
						result.error(error);
						
					return result;
	 			},
	 			
	 			updateStatement: function( statement, success, error )
	 			{
	 				var trackers = [];
	 				angular.forEach
	 				(
	 					statement.trackers,
	 					function(key)
	 					{
	 						if( trackersModel.definitionsIndexed[key] )
	 							trackers.push( trackersModel.definitionsIndexed[key] );
	 						else if( vitalsModel.definitionsIndexed[key] )
	 							trackers.push( vitalsModel.definitionsIndexed[key] );
	 						else 
	 							trackers.push( {type:'medication',id:key} );
	 					}
	 				);
	 				
	 		    	var now = new Date().toISOString();
	 				var condition = adapter.getCondition( statement, trackers, model.patient.id, now );
	 				
					if( constants.DEBUG ) 
						console.log( 'addStatement', condition );
					
					var url = constants.REST_URL + "condition/@" + statement.id;
					
					var result = $http.put(url,condition,{headers: {'token':model.token}});
					
					if( success )
						result.success(success);
					if( error )
						result.error(error);
						
					return result;
	 			}
	 		};
	 	}
	 ]
);
