app.factory
(
	'vitalsService',
	[
	 	'$http','$q','$timeout','model','vitalsModel','navigation','constants','fhir-factory','utilities','ENV',
	 	function($http,$q,$timeout,model,vitalsModel,navigation,constants,adapter,utilities,ENV)
	 	{
	 		var service = {
		 			
		 			init: function()
		 			{
		 				this.getDefinitions().then(this.getRecords).then(this.getStatements);
		 			},
		 			
		 			getDefinitions: function(onSuccess,onError)
		 		    {
		 				var url = ENV.API_URL + "definition/search?type=vital";
		 				
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
	 			 		    	
	 			 		    	vitalsModel.definitions = definitions.sort( utilities.sortByLabel );
	 			 		    	vitalsModel.definitionsIndexed = definitionsIndexed;
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
		 		    	var url = ENV.API_URL + "vitalstatement/search?subject=" + model.patient.id;
		 		 		
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

		 				if( onSuccess )
							result.success(onSuccess);
						if( onError )
							result.error(onError);
						
						return result;
		 			},
		 			
		 		    addStatement: function( data, onSuccess, onError )
		 			{
		 		    	var vital = adapter.getVitalStatement(model.patient.id,data.name,data.code,data.codeName,data.codeURI);
		 				
						if( constants.DEBUG ) 
							console.log( 'addStatement', vital );
						
						var url = ENV.API_URL + "vitalstatement";
						
						var result = $http.put(url,vital,{headers: {'token':model.token}});
						
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
						
						var url = ENV.API_URL + "vitalstatement/delete/@" + data.id;
						
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
		 				
		 				for(var r in vitalsModel.records)
		 					if( vitalsModel.records[r].code == tracker.definition.code )
		 						records.push( vitalsModel.records[r] );
		 				
		 				return records;
		 			},
		 			
		 			getStatementById: function(id)
		 			{
		 				for(var s in vitalsModel.statements)
		 					if( vitalsModel.statements[s].code == id )
		 						return vitalsModel.statements[s];
		 				
		 				return false;
		 			}
		 		};
	 		
	 		return service;
	 	}
	 ]
);
