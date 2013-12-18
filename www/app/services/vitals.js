app.factory
(
	'vitalsService',
	[
	 	'$http','$q','$timeout','model','vitalsModel','navigation','constants',
	 	function($http,$q,$timeout,model,vitalsModel,navigation,constants)
	 	{
	 		var _definitions =
				[
				 	{
				 		id: "3141-9", 
				 		label:"Weight", labelShort:"Weight", unit: "pounds", 
				 		components:[{id:"weight",type:"range",min:50,max:500}],
				 		chart: {type:'line',allowPointSelect:true,markerEnabled:true},
				 		code_name:"Body weight Measured",code_uri:constants.LOINC_URL
				 	},
				 	{
				 		id: "55284-4", 
				 		label:"Blood Pressure", labelShort:"Blood Pr.", unit: "mmHg", multiline: false,
				 		chart: {type:'arearange',allowPointSelect:true},
				 		code_name:"Blood pressure systolic and diastolic",code_uri:constants.LOINC_URL,
				 		components:[{id:"systolic",label:"Systolic",type:"text",suffix:"/"},{id:"diastolic",label:"Diastolic",type:"text",suffix:""}]
				 	},
				 	{
				 		id: "8867-4", 
				 		label:"Heart Rate", labelShort:"Heart Rate", unit: "beats/min",
				 		components:[{id:"heartrate",type:"range",min:60,max:100,step:1}],
				 		chart: {type:'line',allowPointSelect:false},
				 		code_name:"Heart rate",code_uri:constants.LOINC_URL
				 	},
				 	{
				 		id: "9279-1", 
				 		label:"Respiratory Rate", labelShort:"Respiratory", unit: "breaths/min",
				 		components:[{id:"respiratoryrate",type:"range",min:10,max:60,step:1}],
				 		chart: {type:'line',allowPointSelect:false},data:null,
				 		code_name:"Respiratory rate",code_uri:constants.LOINC_URL
				 	},
				 	{
				 		id: "8310-5", 
				 		label:"Temperature", labelShort:"Temp.", unit: "° Fahrenheit",
				 		components:[{id:"temperature",type:"range",min:95,max:105,step:.1}],
				 		chart: {type:'line',allowPointSelect:false},data:null,
				 		code_name:"Body temperature",code_uri:constants.LOINC_URL
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
	 		    			var definitions = new Array();
	 		 		    	
	 		 		    	for(var v in _definitions)
	 		 		    	{
	 		 		    		var definition = _definitions[v];
 		 		    			definitions.push( definition );
	 		 		    	}
	 		 		    		
	 		 		    	vitalsModel.definitions = definitions;
	 		 		    	
	 		 		    	deferred.resolve(vitalsModel.definitions);
	 		 		    	
	 		    		},1000
	 		    	);
	 		    	
	 		    	if( constants.DEBUG ) console.log( 'getDefinitions', model.patient.id );
	 		    	
	 		    	return deferred.promise;
	 		    },
	 		    
	 			getStatements: function( data, success, error )
	 		    {
	 		    	var url = constants.REST_URL + "vitalstatement/search?subject=" + model.patient.id;
	 				
	 		    	return $http.get(url,{headers:{'token':model.token}}).success(success).error(error);
	 		    },
	 		    
	 		    addStatement: function( data, success, error )
	 			{
	 				var vital = model.adapter.getVitalStatement(model.patient.id,data.name,data.code,data.code_name,data.code_uri);
	 				
					if( constants.DEBUG ) 
						console.log( 'addStatement', tracker );
					
					var url = constants.REST_URL + "vitalstatement";
					
					return $http.put(url,JSON.stringify(vital),{headers: {'token':model.token}}).success(success).error(error);
	 			},
	 			
	 			deleteStatement: function( data, success, error )
	 			{
	 				if( constants.DEBUG ) 
						console.log( 'deleteStatement', data.id );
					
					var url = constants.REST_URL + "vitalstatement/delete/@" + data.id;
					
					return $http['delete'](url,{headers: {'token':model.token}}).success(success).error(error);
	 			},
	 			
	 			load: function(success,error)
	 			{
	 				var url = constants.REST_URL + "observation/search?subject=" + model.patient.id;
	 				
	 				$http.get(url,{headers:{'token':model.token}}).success
	 				(
	 					function(data, status, headers, config)
						{
	 						var parseResult = model.adapter.parseVitals( data );
			 				
			 				vitalsModel.vitalDefinitions = parseResult.vitals;
			 				
							if( constants.DEBUG ) 
								console.log( "onLoadVitalsSuccess", data );
						}
	 				);
	 				
	 				/*
	 				$.ajax
	 				(
	 					{
	 					    dataType:"json", 
	 					    headers: {token:model.token},
	 					    type:"GET", 
	 					    url:url, 
	 					    success:function(data){success(data);} 
	 					}
	 				);
	 				*/
	 			},
	 			
	 			update: function()
	 			{
	 				//	update model
	 				for(var v in vitalsModel.vitalDefinitions)
	 				{
	 					var vital = vitalsModel.vitalDefinitions[v];
	 					
	 					if( vital.chart )
	 					{
	 						if( vital.id == constants.VITAL_TYPE_BLOOD_PRESSURE )
	 							vital.data = model.patient.getVital(vital.id).map( function(x){return {x:x.date,low:parseFloat(x.value2),high:parseFloat(x.value),fillColor:x.reportedBy==constants.REPORTER_PATIENT?constants.COLOR_PATIENT:constants.COLOR_PROVIDER};} ).sort(function(a,b){return a.x-b.x;});
	 						else
	 							vital.data = model.patient.getVital( vital.id ).map( function(x){return {x:x.date,y:parseFloat(x.value),fillColor:x.reportedBy==constants.REPORTER_PATIENT?constants.COLOR_PATIENT:constants.COLOR_PROVIDER};} ).sort(function(a,b){return a.x-b.x;});
	 					}
	 				}
	 			},
	 			
	 			submit: function(success,error)
	 			{
	 				var observations = new Array();
	 				
	 				var date = vitalsModel.selectedDay;
	 				
	 				if( !date ) return error(null,null,"Please specify a date");
	 				
	 				////////////////////////
	 				
	 				var vitalValues = {};
	 				
	 				for(var v in vitalsModel.vitalDefinitions)
	 				{
	 					var vital = vitalsModel.vitalDefinitions[v];			
	 					
	 					for(var c in vital.components)
	 					{
 							var component = vital.components[c];
 							
 							var label = (component.label ? component.label + " " : "") + vital.label;
 							var value = component.value;
 							
 							if( value != "" && !isNaN(value) )
 							{
 							   if( isNaN(value) ) return error( null,null,label + " must be a number" );
 							    
 							   if( !vitalValues[vital.id] ) vitalValues[vital.id] = {index:v,values:[]};
 							   vitalValues[vital.id].values.push( value );
 							}
 						}
	 				}
	 				
	 				for(var vitalId in vitalValues)
	 				{
	 				    var vital = vitalsModel.vitalDefinitions[ vitalValues[vitalId].index ];
	 				    var label = vital.label;
	 				    var values = vitalValues[vitalId].values;
	 				    
	 				    if( values.length != vital.components.length ) return error( null,null,"Please complete all " + label + " values" );
                        
	 				    observation = model.adapter.getVital( vital.id, values[0], values[1], model.patient.getVitalUnit(vital.id), model.patient.id, date );
                        
                        if( observation )
                            observations.push( observation );
	 				}
	 				
	 				//////////////////
	 				
	 				if( constants.DEBUG ) console.log( 'observations=' + observations );
	 				
	 				if( observations.length == 0 ) return error( null,null,"You haven't entered any vitals!" );
	 				
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
