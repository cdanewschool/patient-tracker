app.factory
(
	'vitalsService',
	[
	 	'$http','$q','$timeout','model','vitalsModel','navigation','constants','fhir-factory','utilities',
	 	function($http,$q,$timeout,model,vitalsModel,navigation,constants,adapter,utilities)
	 	{
	 		return {
	 			
	 			init: function(success,error)
	 			{
	 				var self = this;
	 				
	 				this.getDefinitions().then
					(
						function()
						{
							self.getStatements();
							self.getRecords();
						}
					);
	 			},
	 			
	 			getDefinitions: function(success,error)
	 		    {
	 				var url = constants.REST_URL + "definition/search?type=vital";
	 				
	 		    	return $http.get(url,{headers:{'token':model.token}}).then
	 		    	(
	 		    		function(data)
	 		    		{
	 		    			var data = data.data;
	 		    			
	 		    			var definitions = new Array();
 			 		    	var definitionsIndexed = {};
 			 		    	
 			 		    	for(var v in data)
 			 		    	{
 			 		    		var definition = data[v];
 			 		    		definitions.push( definition );
 			 		    		
 			 		    		definitionsIndexed[definition.code] = definition;
 			 		    	}
 			 		    	
 			 		    	vitalsModel.definitions = definitions;
 			 		    	vitalsModel.definitionsIndexed = definitionsIndexed;
	 		    		}
	 		    	);
	 		    },
	 		    
	 			getStatements: function()
	 		    {
	 		    	var url = constants.REST_URL + "vitalstatement/search?subject=" + model.patient.id;
	 				
	 		    	return $http.get(url,{headers:{'token':model.token}}).then
	 		    	(
	 		    		function(data)
	 		    		{
	 		    			var data = data.data;
	 		    			
	 		    			vitalsModel.statements = adapter.parseVitalStatements( data );
	 		 				
	 						if( constants.DEBUG ) 
	 							console.log( "getVitalStatements success", vitalsModel.statements );
	 		    		}
	 		    	);
	 		    },
	 		    
	 		    getRecords: function()
	 			{
	 				var url = constants.REST_URL + "observation/search?subject=" + model.patient.id;
	 				
	 				return $http.get(url,{headers:{'token':model.token}}).then
	 				(
	 					function(data)
	 					{
	 						var data = data.data;
	 						
	 						var parseResult = adapter.parseVitalRecords( data );
	 			 			
	 	 					var records = parseResult.vitals;
	 			 			records.sort( utilities.sortByDate );
	 			 			
	 			 			vitalsModel.records = records;
	 			 			
	 						if( constants.DEBUG ) 
	 							console.log( "getRecords success", vitalsModel.records );
	 					}
	 				);
	 			},
	 			
	 		    addStatement: function( data, success, error )
	 			{
	 				var vital = adapter.getVitalStatement(model.patient.id,data.name,data.code,data.code_name,data.code_uri);
	 				
					if( constants.DEBUG ) 
						console.log( 'addStatement', vital );
					
					var url = constants.REST_URL + "vitalstatement";
					
					return $http.put(url,vital,{headers: {'token':model.token}}).success(success).error(error);
	 			},
	 			
	 			addRecord: function(data,success,error)
	 			{
	 				return $http.put(constants.REST_URL + "observation",data,{headers: {'token':model.token}}).success(success).error(error);
	 			},
	 			
	 			deleteStatement: function( data, success, error )
	 			{
	 				if( constants.DEBUG ) 
						console.log( 'deleteStatement', data.id );
					
					var url = constants.REST_URL + "vitalstatement/delete/@" + data.id;
					
					return $http['delete'](url,{headers: {'token':model.token}}).success(success).error(error);
	 			}
	 		};
	 	}
	 ]
);
