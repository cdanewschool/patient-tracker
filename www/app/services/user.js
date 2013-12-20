app.factory
(
	'userService',
	[
	 	'$rootScope','$http','model','userModel','navigation','constants','fhir-factory',
	 	function($rootScope,$http,model,userModel,navigation,constants,adapter)
	 	{
	 		return {
	 			
	 			submitLogin: function(data,success,error)
				{
		 			var url = constants.REST_URL + "login";
					
					return $http.post(url,JSON.stringify(data)).success(success).error(error);
				},
				
				submitSignup: function(data,success,error)
				{
					var url = constants.REST_URL + "user";
					
					var user = adapter.getUser( data.username, data.password, data.name_first + ' ' + data.name_last );
					
					var data = {};
					
					for(var p in user)
						data[p]=user[p];
		 			
					return $http.put(url,JSON.stringify(data)).success(success).error(error);
				},
				
				submitEditProfile: function(data,success,error)
				{
					var url = constants.REST_URL + "user/@" + userModel.user._id;
					
					return $http.put(url,JSON.stringify(data),{headers:{token:model.token}}).success(success).error(error);
				},
				
				checkUsername: function(data,success,error)
				{
					var url = constants.REST_URL + "user/search?username=" + data.username;
					
					return $http.get(url,data).success(success).error(error);
				}
	 		};
	 	}
	 ]
);