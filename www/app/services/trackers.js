app.factory
(
	'trackersService',
	[
	 	'$http','$q','$timeout','model','trackersModel','navigation','constants','fhir-factory','utilities',
	 	function($http,$q,$timeout,model,trackersModel,navigation,constants,adapter,utilities)
	 	{
	 		var service = {
		 			
	 			init: function()
	 			{
	 				var self = this;
	 				
	 				this.getDefinitions().then(this.getRecords).then(this.getStatements);
	 			},
	 			
	 			getDefinitions: function(success,error)
	 		    {
	 				var url = constants.REST_URL + "definition/search?type=custom";
		 			
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
		 		    			
		 		    			for(var c in definition.components)
		 		    			{
		 		    				if( definition.components[c].code
		 		    					&& !definitionsIndexed[definition.components[c].code] )
		 		    					definitionsIndexed[definition.components[c].code] = definition.components[c];
		 		    			}
		 		    			
		 		    			definitionsIndexed[definition.code] = definition;
		 		    			definitions.push( definition );
			 		    	}
			 		    	
			 		    	trackersModel.definitions = definitions;
			 		    	trackersModel.definitionsIndexed = definitionsIndexed;
			 		    	
			 		    	console.log( "getDefinitions success", trackersModel.definitionsIndexed );
		 		    	}
		 		    );
 				
	 				if( success )
						result.success = success;
					if( error )
						result.error = error;
					
					return result;
	 		    },
	 		    
	 		    getStatements: function(success,error)
	 		    {
	 		    	var url = constants.REST_URL + "trackerstatement/search?subject=" + model.patient.id;
	 		    	
	 		    	var result = $http.get(url,{headers:{'token':model.token}}).then
	 		    	(
	 		    		function(response)
	 		    		{
	 		    			var data = response.data;
	 		    			
	 		    			trackersModel.statements = adapter.parseTrackerStatements( data );
	 		 				
	 						if( constants.DEBUG ) 
	 							console.log( "getStatements success", trackersModel.statements );
	 		    		}
	 		    	);
	 		    	
	 		    	if( success )
						result.success = success;
					if( error )
						result.error = error;
					
					return result;
	 		    },
	 		    
	 		    getRecords: function(success,error)
	 			{
	 				var url = constants.REST_URL + "observation/search?subject=" + model.patient.id;
	 				
	 				var result = $http.get(url,{headers:{'token':model.token}}).then
	 				(
	 					function(response)
	 					{
	 						var data = response.data;
	 						
	 						var parseResult = adapter.parseVitalRecords( data );
	 			 			
	 	 					var records = parseResult.trackers;
	 			 			records.sort( utilities.sortByDate );
	 			 			
	 			 			trackersModel.records = records;
	 			 			
	 						if( constants.DEBUG ) 
	 							console.log( "getRecords success", trackersModel.records );
	 					}
	 				);
	 				
	 				if( success )
						result.success = success;
					if( error )
						result.error = error;
					
					return result;
	 			},
	 			
	 		    addStatement: function( data, success, error )
	 			{
	 		    	var tracker = adapter.getTrackerStatement(model.patient.id,data.name,data.code,data.codeName,data.codeURI);
	 				
	 				if( constants.DEBUG ) 
						console.log( 'addStatement', tracker );
					
					var url = constants.REST_URL + "trackerstatement";
					
					var result = $http.put(url,tracker,{headers: {'token':model.token}});
					
					if( success )
						result.success = success;
					if( error )
						result.error = error;
					
					return result;
	 			},
	 			
	 			addRecord: function(data,success,error)
	 			{
	 				var result = $http.put(constants.REST_URL + "observation",data,{headers: {'token':model.token}});
	 				
	 				if( success )
						result.success = success;
					if( error )
						result.error = error;
					
					return result;
	 			},
	 			
	 			deleteStatement: function( data, success, error )
	 			{
	 				if( constants.DEBUG ) 
						console.log( 'deleteStatement', data.id );
					
					var url = constants.REST_URL + "trackerstatement/delete/@" + data.id;
					
					var result = $http['delete'](url,{headers: {'token':model.token}});
					
					if( success )
						result.success = success;
					if( error )
						result.error = error;
					
					return result;
	 			},
	 			
	 			getRecordsForTracker: function(tracker)
	 			{
	 				var records = new Array();
	 				
	 				for(var r in trackersModel.records)
	 					if( trackersModel.records[r].code == tracker.code )
	 						records.push( trackersModel.records[r] );
	 				
	 				return records;
	 			}
	 		};
	 		
	 		return service;
	 	}
	 ]
);
