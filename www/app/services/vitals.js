app.factory
(
	'vitalsService',
	[
	 	'$http','$q','$timeout','model','vitalsModel','navigation','constants','fhir-factory','utilities',
	 	function($http,$q,$timeout,model,vitalsModel,navigation,constants,adapter,utilities)
	 	{
	 		var service = {
		 			
		 			init: function()
		 			{
		 				this.getDefinitions().then(this.getRecords).then(this.getStatements);
		 			},
		 			
		 			getDefinitions: function(success,error)
		 		    {
		 				var url = constants.REST_URL + "definition/search?type=vital";
		 				
		 		    	var result = $http.get(url,{headers:{'token':model.token}}).then
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
		 		    	
		 		    	if( success )
							result.success(success);
						if( error )
							result.error(error);
						
						return result;
		 		    },
		 		    
		 			getStatements: function(success,error)
		 		    {
		 		    	var url = constants.REST_URL + "vitalstatement/search?subject=" + model.patient.id;
		 		 		
		 		    	var result = $http.get(url,{headers:{'token':model.token}}).then
		 		    	(
		 		    		function(data)
		 		    		{
		 		    			var data = data.data;
		 		    			
		 		    			vitalsModel.statements = adapter.parseVitalStatements( data );
		 		 				
		 						if( constants.DEBUG ) 
		 							console.log( "getVitalStatements success", vitalsModel.statements );
		 		    		}
		 		    	);
		 		    	
		 		    	if( success )
							result.success(success);
						if( error )
							result.error(error);
						
						return result;
		 		    },
		 		    
		 		    getRecords: function(success,error)
		 			{
		 				var url = constants.REST_URL + "observation/search?subject=" + model.patient.id;
		 				
		 				var result = $http.get(url,{headers:{'token':model.token}}).then
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

		 				if( success )
							result.success(success);
						if( error )
							result.error(error);
						
						return result;
		 			},
		 			
		 		    addStatement: function( data, success, error )
		 			{
		 		    	var vital = adapter.getVitalStatement(model.patient.id,data.name,data.code,data.codeName,data.codeURI);
		 				
						if( constants.DEBUG ) 
							console.log( 'addStatement', vital );
						
						var url = constants.REST_URL + "vitalstatement";
						
						var result = $http.put(url,vital,{headers: {'token':model.token}});
						
						if( success )
							result.success(success);
						if( error )
							result.error(error);
						
						return result;
		 			},
		 			
		 			addRecord: function(data,success,error)
		 			{
		 				var result = $http.put(constants.REST_URL + "observation",data,{headers: {'token':model.token}});
		 				
		 				if( success )
							result.success(success);
						if( error )
							result.error(error);
						
						return result;
		 			},
		 			
		 			deleteStatement: function( data, success, error )
		 			{
		 				if( constants.DEBUG ) 
							console.log( 'deleteStatement', data.id );
						
						var url = constants.REST_URL + "vitalstatement/delete/@" + data.id;
						
						var result = $http['delete'](url,{headers: {'token':model.token}});
						
						if( success )
							result.success(success);
						if( error )
							result.error(error);
						
						return result;
		 			},
		 			
		 			getRecordsForTracker: function(tracker)
		 			{
		 				var records = new Array();
		 				
		 				for(var r in vitalsModel.records)
		 					if( vitalsModel.records[r].code == tracker.definition.code )
		 						records.push( vitalsModel.records[r] );
		 				
		 				return records;
		 			}
		 		};
	 		
	 		return service;
	 	}
	 ]
);
