app.factory
(
	'userService',
	[
	 	'$rootScope','$http','model','userModel','navigation','constants','fhir-factory','ENV',
	 	function($rootScope,$http,model,userModel,navigation,constants,adapter,ENV)
	 	{
	 		return {
	 			
	 			submitLogin: function(data,success,error)
				{
		 			var url = ENV.API_URL + "auth/login";
					
					return $http.post(url,data).success(success).error(error);

				},
				
				submitLogout: function(data,success,error)
				{
		 			var url = ENV.API_URL + "auth/logout";
					
					return $http.post(url,JSON.stringify(data), {headers:{'token':model.token}}).success(success).error(error);
				},
				
				submitSignup: function(data,success,error)
				{
					var url = ENV.API_URL + "auth/user";
					
					var user = {};
					
					for(var p in data)
						user[p]=data[p];
		 			
					return $http.put(url,user).success(success).error(error);
				},
				
				submitEditProfile: function(data,success,error)
				{
					var url = ENV.API_URL + "auth/user/@" + userModel.user._id;
					
					return $http.put(url,data,{headers:{token:model.token}}).success(success).error(error);
				},
				
				checkUsername: function(data,success,error)
				{
					var url = ENV.API_URL + "user/search?username=" + data.username;
					
					return $http.get(url,data).success(success).error(error);
				},
				
				getSession: function(data,success,error)
				{
					var url = ENV.API_URL + "auth/session";
					console.log(url)
					return $http.post(url,data).success(success).error(error);
				}
	 		};
	 	}
	 ]
);
