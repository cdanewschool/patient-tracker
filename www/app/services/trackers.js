app.factory
(
	'trackersService',
	[
	 	'$http','$q','$timeout','model','trackersModel','navigation','constants','fhir-factory','utilities','ENV',
	 	function($http,$q,$timeout,model,trackersModel,navigation,constants,adapter,utilities,ENV)
	 	{
	 		var service = {
		 			
	 			init: function()
	 			{
	 				this.getDefinitions().then(this.getRecords).then(this.getStatements);
	 			},
	 			
	 			getDefinitions: function(onSuccess,onError)
	 		    {
	 				var url = ENV.API_URL + "definition/search?type=custom";
		 			
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
			 		    	
			 		    	trackersModel.definitions = definitions.sort( utilities.sortByLabel );
			 		    	trackersModel.definitionsIndexed = definitionsIndexed;
			 		    	
			 		    	console.log( "getDefinitions success", trackersModel.definitionsIndexed );
		 		    	}
		 		    );
 				
	 				if( onSuccess )
						result.success(onSuccess);
					if( onError )
						result.error(onError);
					
					return result;
	 		    },
	 		    
	 		    getStatements: function(onSuccess,onError)
	 		    {
	 		    	var url = ENV.API_URL + "trackerstatement/search?subject=" + model.patient.id;
	 		    	
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
	 		    	
	 		    	if( onSuccess )
						result.success(onSuccess);
					if( onError )
						result.error(onError);
					
					return result;
	 		    },
	 		    
	 		    getRecords: function(onSuccess,onError)
	 			{
	 				var url = ENV.API_URL + "observation/search?subject=" + model.patient.id;
	 				
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
	 				
	 				//	for some reason result isn't an HttpPromise in some cases, so I added a check here
	 				if( onSuccess && result.success )
						result.success(onSuccess);
					if( onError && result.error )
						result.error(onError);
					
					return result;
	 			},
	 			
	 		    addStatement: function( data, onSuccess, onError )
	 			{
	 		    	var tracker = adapter.getTrackerStatement(model.patient.id,data.name,data.code,data.codeName,data.codeURI);
	 				
	 				if( constants.DEBUG ) 
						console.log( 'addStatement', tracker );
					
					var url = ENV.API_URL + "trackerstatement";
					
					var result = $http.put(url,tracker,{headers: {'token':model.token}});
					
					if( onSuccess )
						result.success(onSuccess);
					if( onError )
						result.error(onError);
					
					return result;
	 			},
	 			
	 			addRecord: function(data,onSuccess,onError)
	 			{
	 				var result = $http.put(ENV.API_URL + "observation",data,{headers: {'token':model.token}});
	 				
	 				if( onSuccess )
						result.success(onSuccess);
					if( onError )
						result.error(onError);
					
					return result;
	 			},
	 			
	 			deleteStatement: function( data, onSuccess, onError )
	 			{
	 				if( constants.DEBUG ) 
						console.log( 'deleteStatement', data.id );
					
					var url = ENV.API_URL + "trackerstatement/delete/@" + data.id;
					
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
