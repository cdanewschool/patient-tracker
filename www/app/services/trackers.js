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
			 		    	
			 		    	if( constants.DEBUG ) 
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
	 		    	var self = this;
	 		    	
	 		    	var result = $http.get(url,{headers:{'token':model.token}}).then
	 		    	(
	 		    		function(response)
	 		    		{
	 		    			var data = response.data;
	 		    			
	 		    			trackersModel.statements = adapter.parseTrackerStatements( data );
	 		 				
	 		    			service.syncStatements();
	 		    			
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
	 				var self = this;
	 				
	 				var result = $http.get(url,{headers:{'token':model.token}}).then
	 				(
	 					function(response)
	 					{
	 						var data = response.data;
	 						
	 						var parseResult = adapter.parseVitalRecords( data );
	 			 			
	 	 					var records = parseResult.trackers;
	 			 			records.sort( utilities.sortByDate );
	 			 			
	 			 			trackersModel.records = records;
	 			 			
	 			 			service.syncStatements();
	 			 			
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
	 		    	var tracker = adapter.getTrackerStatement(model.patient.id,data.name,data.code,data.codeName,data.codeURI,data.enableReminders,data.frequency,data.repeatUnit);
	 				
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
	 			},
	 			
	 			getStatementById: function(id)
	 			{
	 				for(var s in trackersModel.statements)
	 					if( trackersModel.statements[s].code == id )
	 						return trackersModel.statements[s];
	 				
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
	 				for(var s in trackersModel.statements)	//	iterate over trackers for user
	 				{
	 					var records = this.getRecordsForTracker(trackersModel.statements[s]);	//	data for tracker
	 					var definition = trackersModel.definitionsIndexed[ trackersModel.statements[s].code ];	//	definition for this tracker
	 					
	 					trackersModel.statements[s].definition = definition;
	 					
	 					var values = new Array();
	 					var valuesFlat = new Array();
	 					var valuesIndexed = new Array();
	 					
	 					angular.forEach	//	iterate over records for tracker
	 					(
	 						records,
	 						function(r)
	 						{
	 							//	while most trackers contain only one value, they can contain multiple values
	 							//	 so, iterate over values for this record and index them
	 							for(var i=0;i<r.values.length;i++)
	 							{
	 								valuesIndexed[i] = valuesIndexed[i] ? valuesIndexed[i].concat( r.values[i].values ) : r.values[i].values;
	 							}
	 							
	 							var vals = r.values.map(function(a){ return a.values[0]; } );
	 							
	 							//	if the record's first value (value that gets charted) is a string we 
	 							//	convert it to a numeric value, by finding the corresponding index in
	 							//	the value definition
	 							if( r.values
		 							&& r.values.length
		 							&& (typeof r.values[0].values[0] == 'string' ) )
		 						{
		 							angular.forEach
		 							(
		 								definition.components[0].values,
		 								function(valueOption,index)
		 								{
		 									if( valueOption.label == r.values[0].values[0] )
		 									{
		 										r.values[0].values[0] = index;
		 									}
		 								}
		 							);
		 						}
	 							
	 							valuesFlat = values.concat( vals );
	 							values.push( r.unitLabel ? {values:vals,unit:r.unitLabel} : {values:vals}  );
	 						}
	 					);
	 					
	 					if( values.length )
	 					{
	 						var dataType = typeof values[values.length-1].values[0];
	 						
	 						if( dataType == 'string' )
	 							trackersModel.statements[s].chartType = constants.CHART_TYPE_BUBBLE;
	 						else
	 							if( definition.valueLabelDepth>1 )
	 								trackersModel.statements[s].chartType = constants.CHART_TYPE_AREARANGE;
	 							else
	 								trackersModel.statements[s].chartType = constants.CHART_TYPE_LINE;
	 					}
	 					
	 					var lastLabelValues = values.length ? values[values.length-1].values.slice( 0, Math.min(definition.valueLabelDepth,values.length) ) : new Array();
	 					var lastLabelUnits = values.length ? values[values.length-1].unit : null;
	 					
	 					var valueSummary = 
	 					{
	 						min: _.min( valuesFlat ), 
	 						max: _.max( valuesFlat ), 
	 						values: valuesIndexed, 
	 						lastValue: {value:lastLabelValues.join("/"),unit:lastLabelUnits} 
	 					};
	 					
	 					trackersModel.statements[s].valueSummary = valueSummary;
	 					trackersModel.statements[s].records = records;
	 				}
	 			}
	 		};
	 		
	 		return service;
	 	}
	 ]
);
