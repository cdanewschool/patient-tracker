app.factory
(
	'vitalsService',
	[
	 	'$http','$q','$timeout','model','vitalsModel','navigation','constants','fhir-factory',
	 	function($http,$q,$timeout,model,vitalsModel,navigation,constants,adapter)
	 	{
	 		var _definitions =
				[
				 	{
				 		id: constants.VITAL_TYPE_WEIGHT, label:"Weight", unit: "pounds", actionLabel: "I weighed",
				 		components:
				 			[
				 			 	{
				 			 		id:"weight",type:"range",min:50,max:500
				 			 	}
				 			 ],
				 		chart: 
				 		{
				 			type:'line',allowPointSelect:true,markerEnabled:true
				 		},
				 		code:"3141-9",codeName:"Body weight Measured",codeURI:constants.LOINC_URL
				 	},
				 	{
				 		id: constants.VITAL_TYPE_BLOOD_PRESSURE, label:"Blood Pressure", unit: "mmHg", actionLabel: "My blood pressure was",
				 		multiline: false,
				 		chart: 
				 		{
				 			type:'arearange',allowPointSelect:true
				 		},
				 		code:"55284-4",codeName:"Blood pressure systolic and diastolic",codeURI:constants.LOINC_URL,
				 		components:
				 			[
				 			 	{
				 			 		id:"systolic",label:"Systolic",type:"text"
				 			 	},
				 			 	{
				 			 		id:"diastolic",label:"Diastolic",type:"text"
				 			 	}
				 			]
				 	},
				 	{
				 		id: constants.VITAL_TYPE_HEART_RATE,label:"Heart Rate", unit: "beats/min", actionLabel: "My heart rate was",
				 		components:
				 			[
				 			 	{
				 			 		id:"heartrate",type:"range",min:60,max:100,step:1
				 			 	}
				 			 ],
				 		chart: 
				 		{
				 			type:'line',allowPointSelect:false
				 		},
				 		code:"8867-4",codeName:"Heart rate",codeURI:constants.LOINC_URL
				 	},
				 	{
				 		id: constants.VITAL_TYPE_RESPIRATORY_RATE, label:"Respiratory Rate", unit: "breaths/min", actionLabel: "My respiratory rate was", 
				 		components:
				 			[
				 			 	{
				 			 		id:"respiratoryrate",type:"range",min:10,max:60,step:1
				 			 	}
				 			 ],
				 		chart: 
				 		{
				 			type:'line',allowPointSelect:false
				 		},
				 		code:"9279-1",codeName:"Respiratory rate",codeURI:constants.LOINC_URL
				 	},
				 	{
				 		id: constants.VITAL_TYPE_BODY_TEMPERATURE, label:"Temperature", unit: "° Fahrenheit", actionLabel: "My temperature was", 
				 		components:
				 			[
				 			 	{
				 			 		id:"temperature",type:"range",min:95,max:105,step:.1
				 			 	}
				 			 ],
				 		chart: 
				 		{
				 			type:'line',allowPointSelect:false
				 		},
				 		code:"8310-5",codeName:"Body temperature",codeURI:constants.LOINC_URL
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
	 		 		    	var definitionsIndexed = {};
	 		 		    	
	 		 		    	for(var v in _definitions)
	 		 		    	{
	 		 		    		var definition = _definitions[v];
 		 		    			definitions.push( definition );
 		 		    			
 		 		    			definitionsIndexed[definition.code] = definition;
	 		 		    	}
	 		 		    	
	 		 		    	vitalsModel.definitions = definitions;
	 		 		    	vitalsModel.definitionsIndexed = definitionsIndexed;
	 		 		    	
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
	 				var vital = adapter.getVitalStatement(model.patient.id,data.name,data.code,data.code_name,data.code_uri);
	 				
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
	 			
	 			getRecords: function(success,error)
	 			{
	 				var url = constants.REST_URL + "observation/search?subject=" + model.patient.id;
	 				
	 				return $http.get(url,{headers:{'token':model.token}}).success(success).error(error);
	 			},
	 			
	 			/*
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
	 			*/
	 			
	 			addRecord: function(data,success,error)
	 			{
	 				return $http.put(constants.REST_URL + "observation",JSON.stringify(data),{headers: {'token':model.token}}).success(success).error(error);
	 			}
	 		};
	 	}
	 ]
);
