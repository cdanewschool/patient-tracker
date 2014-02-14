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
	 			 		    	
	 			 		    	if( constants.DEBUG ) 
	 			 		    		console.log( "getDefinitions success", vitalsModel.definitionsIndexed );
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
		 		 				
		 		    			service.syncStatements();
		 		    			
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
		 			 			
		 			 			service.syncStatements();
		 			 			
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
		 		    	var vital = adapter.getVitalStatement(model.patient.id,data.name,data.code,data.codeName,data.codeURI,data.enableReminders,data.frequency,data.repeatUnit);
		 				
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
		 				for(var s in vitalsModel.statements)	//	iterate over trackers for user
		 				{
		 					var records = this.getRecordsForTracker(vitalsModel.statements[s]);	//	data for tracker
		 					var definition = vitalsModel.definitionsIndexed[ vitalsModel.statements[s].code ];	//	definition for this tracker
		 					
		 					var values = new Array();
		 					var valuesFlat = new Array();
		 					var valuesIndexed = new Array();
		 					
		 					angular.forEach	//	iterate over records for tracker
		 					(
		 						records,
		 						function(r)
		 						{
		 							//	while most trackers contain only one value, they can contain multiple values
		 							//	so, iterate over values for this record and index them
		 							for(var i=0;i<r.values.length;i++)
		 							{
		 								valuesIndexed[i] = valuesIndexed[i] ? valuesIndexed[i].concat( r.values[i].values ) : r.values[i].values;
		 							}
		 							
		 							var vals = r.values.map(function(a){ return a.values[0]; } );
		 							
		 							valuesFlat = values.concat( vals );
		 							values.push( r.unitLabel ? {values:vals,unit:r.unitLabel} : {values:vals}  );
		 						}
		 					);
		 					
		 					var lastLabelValues = values.length ? values[values.length-1].values.slice( 0, Math.min(definition.valueLabelDepth,values.length) ) : new Array();
		 					var lastLabelUnits = values.length ? values[values.length-1].unit : null;
		 					
		 					var valueSummary = 
		 					{
		 						min: _.min( valuesFlat ), 
		 						max: _.max( valuesFlat ), 
		 						values: valuesIndexed, 
		 						lastValue: {value:lastLabelValues.join("/"),unit:lastLabelUnits} 
		 					};
		 					
		 					vitalsModel.statements[s].valueSummary = valueSummary;
		 					vitalsModel.statements[s].records = records;
		 				}
		 			}
		 		};
	 		
	 		return service;
	 	}
	 ]
);
