app.factory
(
	'trackersService',
	[
	 	'$http','$q','$timeout','model','trackersModel','navigation','constants','fhir-factory',
	 	function($http,$q,$timeout,model,trackersModel,navigation,constants,adapter)
	 	{
	 		var _definitions = 
	 			[
	 			 	{
	 			 		label:"Time spent",
	 			 		max:24,
	 			 		items:
	 			 			[
	 			 			 	{
									id:"129060000",label:"driving",actionLabel: "I drove for", 
									unitLabel:"hours",unit:"hour",value:0,
									code_name:"Driving (observable entity)",code_uri:constants.SNOMED_URL
								},
								{
									id:"exercising",label:"exercising",actionLabel: "I exercised for", 
									unitLabel:"hours",unit:"hour",value:1,
									items:
										[
								 		 	{id:"7934008",label:"Passive exercise",code_name:"Passive physical exercise (observable entity)",code_uri:constants.SNOMED_URL},
								 		 	{id:"35360009",label:"Isometric exercise",code_name:"Isometric physical exercise (observable entity)",code_uri:constants.SNOMED_URL},
								 		 	{id:"86047003",label:"Strenuous exercise",code_name:"Active physical exercise (observable entity)",code_uri:constants.SNOMED_URL}
								 		 ]
								},
								{
									id:"50360004",label:"reading",actionLabel: "I read for", 
									unitLabel:"hours",unit:"hour",value:0,
									code_name:"Reading (observable entity)",code_uri:constants.SNOMED_URL
								},
								{
									id:"364316005",label:"engaging in sexual activity",actionLabel: "I had sex for", 
									unitLabel:"hours",unit:"hour",value:0,
									code_name:"Sexual intercourse observable (observable entity)",code_uri:constants.SNOMED_URL
								},
								{
									id:"57206007",label:"singing",actionLabel: "I sang for", 
									unitLabel:"hours",unit:"hour",value:0,
									code_name:"Singing (observable entity)",code_uri:constants.SNOMED_URL
								},
								{
									id:"129011005",label:"shopping",actionLabel: "I shopped for", 
									unitLabel:"hours",unit:"hour",value:0,
									code_name:"Shopping (observable entity)",code_uri:constants.SNOMED_URL
								},
								{
				 			 		id:"258158006",label:"Sleeping",actionLabel: "I slept for", 
				 			 		unitLabel:"hours",unit:"hour",value:0,
				 			 		code_name:"Sleep, function (observable entity)",code_uri:constants.SNOMED_URL
				 			 	},
								{
									id:"288544007",label:"talking about feelings",actionLabel: "I talked about my feelings", 
									unitLabel:"hours",unit:"hour",value:0,
									code_name:"Communicating feelings, function (observable entity)",code_uri:constants.SNOMED_URL
								},
								{
									id:"129013008",label:"using telephone",actionLabel: "I used the phone", 
									unitLabel:"hours",unit:"hour",value:0,
									code_name:"Using telephone (observable entity)",code_uri:constants.SNOMED_URL
								}
	 			 			 ]
	 			 	},
	 			 	
	 			 	{
	 			 		label:"Amount of",
	 			 		items:
	 			 			[
	 			 			 	{
					 			 	id:"alcohol",label:"alcohol consumed",actionLabel: "I drank", 
					 			 	unitLabel:"drinks",unit:"drinks",max:24,value:0,
					 			 	items:
										[
								 		 	{id:"230085005",label:"Beer",code_name:"Beer intake (observable entity)",code_uri:constants.SNOMED_URL},
								 		 	{id:"230088007",label:"Hard liquor",code_name:"Hard liquor intake (observable entity)",code_uri:constants.SNOMED_URL},
								 		 	{id:"230086006",label:"Wine intake",code_name:"Wine intake (observable entity) ",code_uri:constants.SNOMED_URL}
								 		 ]
					 			 },
					 			 {
									id:"cigarettes",label:"cigarettes smoked",actionLabel: "I smoked", 
									unitLabel:"cigarettes",unit:"cigarettes",max:100,value:0,
									code:"230056004",code_uri:constants.SNOMED_URL,code_name:"Cigarette consumption (observable entity)"
					 			 },
					 			 {
									id:"caffeine",label:"caffeine consumed",actionLabel: "I drank", 
									unitLabel:"cups",unit:"cup",max:10,value:0,
									items:
										[
								 		 	{id:"230056004",label:"Coffee",code_name:"Coffee intake (observable entity)",code_uri:constants.SNOMED_URL},
								 		 	{id:"226383006",label:"Tea",code_name:"Tea intake (observable entity)",code_uri:constants.SNOMED_URL}
								 		 ]
					 			 }
	 			 			 ]
	 			 	}
	 			 ];
	 	
	 		return {
	 			
	 			getDefinitions: function()
	 		    {
	 		    	var deferred = $q.defer();
	 		    	
	 		    	//	testing promises
	 		    	$timeout
	 		    	(
	 		    		function()
	 		    		{
	 		    			//	for now, we get this locally
	 		 		    	var definitions = new Array();
	 		 		    	var definitionsIndexed = {};
	 		 		    	
	 		 		    	for(var g in _definitions)
	 		 		    	{
	 		 		    		var group = _definitions[g];
	 		 		    		
	 		 		    		for(var t in group.items)
	 			 		    	{
	 		 		    			var definition = group.items[t];
	 		 		    			definition.label = group.label + ' ' + definition.label;
	 		 		    			definition.max = typeof definition.max == 'undefined' ? group.max : definition.max;
	 		 		    			
	 		 		    			definitionsIndexed[definition.id] = definition;
	 		 		    			definitions.push( definition );
	 		 		    			
	 		 		    			for(var o in definition.items)
		 			 		    	{
	 		 		    				var option = _.extend(angular.copy(definition),definition.items[o]);
	 		 		    				
	 		 		    				definitionsIndexed[ option.id ] = option;
		 			 		    	}
	 			 		    	};
	 		 		    	}
	 		 		    	
	 		 		    	trackersModel.definitions = definitions;
	 		 		    	trackersModel.definitionsIndexed = definitionsIndexed;
	 		 		    	
	 		 		    	deferred.resolve(trackersModel.definitions);
	 		 		    	
	 		    		},1000
	 		    	);
	 		    	
	 		    	if( constants.DEBUG ) console.log( 'getDefinitions', model.patient.id );
	 		    	
	 		    	return deferred.promise;
	 		    },
	 		    
	 		    getStatements: function( data, success, error )
	 		    {
	 		    	var url = constants.REST_URL + "trackerstatement/search?subject=" + model.patient.id;
	 				
	 		    	return $http.get(url,{headers:{'token':model.token}}).success(success).error(error);
	 		    },
	 		    
	 		    addStatement: function( data, success, error )
	 			{
	 				var tracker = adapter.getTrackerStatement(model.patient.id,data.name,data.code,data.code_name,data.code_uri);
	 				
					if( constants.DEBUG ) 
						console.log( 'addStatement', tracker );
					
					var url = constants.REST_URL + "trackerstatement";
					
					return $http.put(url,JSON.stringify(tracker),{headers: {'token':model.token}}).success(success).error(error);
	 			},
	 			
	 			deleteStatement: function( data, success, error )
	 			{
	 				if( constants.DEBUG ) 
						console.log( 'deleteStatement', data.id );
					
					var url = constants.REST_URL + "trackerstatement/delete/@" + data.id;
					
					return $http['delete'](url,{headers: {'token':model.token}}).success(success).error(error);
	 			},
	 			
	 			load: function(success,error)
	 			{
	 				var url = constants.REST_URL + "observation/search?subject=" + model.patient.id;
	 				
	 				return $http.get(url,{headers:{'token':model.token}}).success
	 				(
	 					function(data, status, headers, config)
						{
	 						var parseResult = adapter.parseTrackers( data );
			 				
			 				trackersModel.definitions = parseResult.vitals;
			 				
							if( constants.DEBUG ) 
								console.log( "onLoadVitalsSuccess", data );
						}
	 				);
	 			},
	 			
	 			update: function()
	 			{
	 				//	update model
	 				for(var t in trackersModel.definitions)
	 				{
	 					var tracker = trackersModel.definitions[t];
	 					tracker.data = model.patient.getTracker(tracker.label).map( function(x){return {x:x.date,y:parseFloat(x.value),fillColor:x.reportedBy==constants.REPORTER_PATIENT?constants.COLOR_PATIENT:constants.COLOR_PROVIDER};} ).sort(function(a,b){return a.x-b.x;});
	 				}
	 			},
	 			
	 			submit: function(success,error)
	 			{
	 				trackersModel.status = "";	//	clear message
	 				
	 				var observations = new Array();
	 				
	 				var date = trackersModel.selectedDay;
	 				
	 				if( !date ) return error(null,null,"Please specify a date");
	 				
	 				var code = "";
	 				var codeSystem = "";
	 				var tracker = adapter.getTracker( trackersModel.selectedTracker.label, trackersModel.selectedTracker.value, trackersModel.selectedTracker.unit, model.patient.id, date, code, codeSystem );
	 				
	 				observations.push( tracker );
	 				
	 				if( constants.DEBUG ) 
	 					console.log( 'submitTracker',observations );
	 				
	 				if( observations.length == 0 ) return error( null,null,"You haven't entered any trackers!" );
	 				
	 				for(var o in observations)
	 				{
	 					$.ajax
	 				    (
	 				    	{
	 				            data: JSON.stringify(observations[o]),
	 				            error: function(jqXHR, textStatus, errorThrown){error(jqXHR, textStatus, errorThrown); },
	 				            headers: {token:model.token},
	 				            success: function(data, textStatus, jqXHR){success(data, textStatus, jqXHR); },
	 				            type: "PUT",
	 				            url: constants.REST_URL + "observation"
	 				    	}
	 				    );
	 				}
	 			    
	 			    return observations.length;
	 			}
	 		};
	 	}
	 ]
);
