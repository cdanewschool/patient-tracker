app.factory
(
	'userService',
	[
	 	'$rootScope','$http','model','userModel','navigation','constants',
	 	function($rootScope,$http,model,userModel,navigation,constants)
	 	{
	 		return {
	 			
	 			//	login
	 			submitLogin: function(data,success,error)
				{
		 			var url = constants.REST_URL + "login";
					
					return $http.post(url,JSON.stringify(data)).success(success).error(error);
					
					/*
					$.ajax
					(
						{
							data: JSON.stringify(user),
			            	dataType:"json",
			            	error: error,
			                success: success,
			            	type: "POST",
			            	url:url
			            }
					);
					*/
				},
				
				//	signup
				submitSignup: function(data,success,error)
				{
					var url = constants.REST_URL + "user";
					
					var user = model.adapter.getUser( data.username, data.password, data.name_first + ' ' + data.name_last );
					
					var data = {};
					
					for(var p in user)
						data[p]=user[p];
		 			
					return $http.put(url,JSON.stringify(data)).success(success).error(error);
					
					/*
					$.ajax
					(
						{
							data: JSON.stringify(user),
			            	dataType:"json",
			            	error: error,
			                success: success,
			            	type: "PUT",
			            	url:url
			            }
					);
					*/
				},
				
				//	signup
				submitEditProfile: function(data,success,error)
				{
					var url = constants.REST_URL + "user/@" + userModel.user._id;
					
					return $http.put(url,JSON.stringify(data),{headers:{token:model.token}}).success(success).error(error);
					
					/*
					$.ajax
					(
						{
							data: JSON.stringify(data),
			            	dataType:"json",
			            	headers: {token:model.token},
			            	error: error,
			                success: success,
			            	type: "PUT",
			            	url:url
			            }
					);
					*/
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