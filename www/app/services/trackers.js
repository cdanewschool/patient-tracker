app.factory
(
	'trackersService',
	[
	 	'$http','$q','$timeout','model','trackersModel','navigation','constants','fhir-factory',
	 	function($http,$q,$timeout,model,trackersModel,navigation,constants,adapter)
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
	 			
	 			getDefinitions: function()
	 		    {
	 				var url = constants.REST_URL + "definition/search?type=custom";
		 			
		 		    return $http.get(url,{headers:{'token':model.token}}).then
		 		    (
		 		    	function(response)
		 		    	{
		 		    		var data = response.data;
		 		    		
		 		    		var definitions = new Array();
			 		    	var definitionsIndexed = {};
			 		    	
			 		    	for(var t in data)
			 		    	{
			 		    		var definition = data[t];
			 		    		
			 		    		var label = definition.label;
			 		    		
			 		    		if( definition.unit == "hour" )
			 		    			label = "Time spent " + label;
			 		    		
		 		    			definition.label = label;
		 		    			
		 		    			for(var c in definition.components)
		 		    			{
		 		    				_.defaults( definition.components[c], definition );
		 		    				
		 		    				if( definition.components[c].code )
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
	 		    },
	 		    
	 		    getStatements: function()
	 		    {
	 		    	var url = constants.REST_URL + "trackerstatement/search?subject=" + model.patient.id;
	 				
	 		    	return $http.get(url,{headers:{'token':model.token}}).then
	 		    	(
	 		    		function(response)
	 		    		{
	 		    			var data = response.data;
	 		    			
	 		    			trackersModel.statements = adapter.parseTrackerStatements( data );
	 		 				
	 						if( constants.DEBUG ) 
	 							console.log( "getStatements success", trackersModel.statements );
	 		    		}
	 		    	);	 		    	
	 		    },
	 		    
	 		    getRecords: function()
	 			{
	 				var url = constants.REST_URL + "observation/search?subject=" + model.patient.id;
	 				
	 				return $http.get(url,{headers:{'token':model.token}}).then
	 				(
	 					function(response)
	 					{
	 						var data = response.data;
	 						
	 						var parseResult = adapter.parseVitalRecords( data );
	 			 			
	 	 					var records = parseResult.trackers;
	 			 			records.sort(function(a,b){return a-b;});
	 			 			
	 			 			trackersModel.records = records;
	 			 			
	 						if( constants.DEBUG ) 
	 							console.log( "getRecords success", trackersModel.records );
	 					}
	 				);
	 			},
	 			
	 		    addStatement: function( data, success, error )
	 			{
	 		    	var tracker = adapter.getTrackerStatement(model.patient.id,data.name,data.code,data.codeName,data.codeURI);
	 				
	 				if( constants.DEBUG ) 
						console.log( 'addStatement', tracker );
					
					var url = constants.REST_URL + "trackerstatement";
					
					return $http.put(url,JSON.stringify(tracker),{headers: {'token':model.token}}).success(success).error(error);
	 			},
	 			
	 			addRecord: function(data,success,error)
	 			{
	 				return $http.put(constants.REST_URL + "observation",JSON.stringify(data),{headers: {'token':model.token}}).success(success).error(error);
	 			},
	 			
	 			deleteStatement: function( data, success, error )
	 			{
	 				if( constants.DEBUG ) 
						console.log( 'deleteStatement', data.id );
					
					var url = constants.REST_URL + "trackerstatement/delete/@" + data.id;
					
					return $http['delete'](url,{headers: {'token':model.token}}).success(success).error(error);
	 			}
	 		};
	 	}
	 ]
);
