app.factory
(
	'trackersService',
	[
	 	'$http','$q','$timeout','model','trackersModel','navigation','constants','fhir-factory',
	 	function($http,$q,$timeout,model,trackersModel,navigation,constants,adapter)
	 	{
	 		return {
	 			
	 			getDefinitions: function(success,error)
	 		    {
	 				var url = constants.REST_URL + "definition/search?type=custom";
		 			
		 		    return $http.get(url,{headers:{'token':model.token}}).success(success).error(error);
	 		    },
	 		    
	 		    getStatements: function( data, success, error )
	 		    {
	 		    	var url = constants.REST_URL + "trackerstatement/search?subject=" + model.patient.id;
	 				
	 		    	return $http.get(url,{headers:{'token':model.token}}).success(success).error(error);
	 		    },
	 		    
	 		    addStatement: function( data, success, error )
	 			{
	 				if( constants.DEBUG ) 
						console.log( 'addStatement', tracker );
					
					var url = constants.REST_URL + "trackerstatement";
					
					return $http.put(url,JSON.stringify(data),{headers: {'token':model.token}}).success(success).error(error);
	 			},
	 			
	 			deleteStatement: function( data, success, error )
	 			{
	 				if( constants.DEBUG ) 
						console.log( 'deleteStatement', data.id );
					
					var url = constants.REST_URL + "trackerstatement/delete/@" + data.id;
					
					return $http['delete'](url,{headers: {'token':model.token}}).success(success).error(error);
	 			},
	 			
	 			getRecords: function(success,error)
	 			{
	 				var url = constants.REST_URL + "observation/search?subject=" + model.patient.id;
	 				
	 				return $http.get(url,{headers:{'token':model.token}}).success(success).error(error);
	 			},
	 			
	 			
	 			addRecord: function(data,success,error)
	 			{
	 				return $http.put(constants.REST_URL + "observation",JSON.stringify(data),{headers: {'token':model.token}}).success(success).error(error);
	 			}
	 			
	 		};
	 	}
	 ]
);
