app.factory
(
	"userModel",
	[
		"model",
	 	function(model)
	 	{
	 		return {
	 			initialized:false,
	 			status:null
	 		};
	 	}
	 ]
);

app.controller
(
	'UserCtrl',
	[
	 	'$scope', '$rootScope', 'model', 'userModel', 'userService', 'navigation', 'constants',
	 	function($scope, $rootScope, model, userModel, userService, navigation, constants)
		{
			$scope.model = model;
			$scope.userModel = userModel;
			$scope.userService = userService;
			$scope.navigation = navigation;
			$scope.status = null;
			
			$scope.form = 
			{
				username:"test@test.com",
				password:"test"
			};
	 		
			$scope.usernameIsUnique = true;

			var initSession = function(data)
			{
				window.localStorage.setItem("token", data.token);
				
				$scope.userModel.userId = data.user._id;
				$scope.userModel.user = data.user;
				
				$scope.model.token = data.token;
				$scope.model.loggedIn = true;
				
				$rootScope.$emit('authenticateSuccess');
			};
			
			$scope.setStatus = function(status)
			{
				status = typeof status != 'undefined' ? status : null;
				
				$scope.status = status;
				
				if( $scope.status )
					$scope.userModel.status = null;
			};
			
			var deleteSession = function(data)
			{
				window.localStorage.removeItem("token");
				
				$scope.userModel.userId = null;
				$scope.userModel.user = null;
				
				$scope.model.token = null;
					
				$rootScope.$emit('logoutSuccess');
			};
						
			$scope.getSession = function()
			{
				var data = {token:window.localStorage.getItem("token")};
				
				return $scope.userService.getSession
				(
					data,
					function(data, status, headers, config)
					{
						if( constants.DEBUG ) 
							console.log( "getSession success", data );
						
						initSession(data);
					},
					function(data, status, headers, config)
					{
					}
				);
			};
			
			$scope.submitLogin = function()
			{
				$scope.setStatus();
				
				var required = ["username","password"];
				
				for(var field in $scope.form)
					if( required.indexOf(field)>-1 && ($scope.form[field] == null || $scope.form[field] == "") ) 
						$scope.setStatus("Please enter a " + field);
				
				if( $scope.status )
					return;
				
				var data = {username:$scope.form.username,password:$scope.form.password};
				
				$scope.userService.submitLogin
				(
					data,
					function(data, status, headers, config)
					{
						if( constants.DEBUG ) 
							console.log( "submitLogin success", data, status, headers, config );
						
						initSession(data);
					},
					function(data, status, headers, config)
					{
					}
				);
			};
			
			$scope.submitLogout = function()
			{
				$scope.setStatus();
						
				if( $scope.status )
					return;
				
				var data = {};
				
				$scope.userService.submitLogout
				(
					data,
					function(data, status, headers, config)
					{
						if( constants.DEBUG ) 
							console.log( "submitLogout success", data, status, headers, config );
						
						deleteSession(data);
					},
					function(data, status, headers, config)
					{
					}
				);
			};
			
			
			$scope.submitSignup = function()
			{
				$scope.setStatus();
				
				if( !$scope.usernameIsUnique )
					$scope.setStatus("Oops, that username is taken!");
				
				if( !$scope.status )
				{
					var required = ["username","password","password_confirm","name_first","name_last"];
					for(var field in $scope.form)
						if( required.indexOf(field)>-1 && ($scope.form[field] == null || $scope.form[field] == "") ) 
							$scope.setStatus("Please enter a " + field);
				}
				
				if( !$scope.status 
					&& $scope.form.password != $scope.form.password_confirm ) 
					$scope.setStatus("Passwords don't match");
				
				if( $scope.status )
					return;
				
				var data = {username:$scope.form.username,password:$scope.form.password,name_first:$scope.form.name_first,name_last:$scope.form.name_last};
				
				$scope.userService.submitSignup
				(
					data,
					function(data)
					{
						var data = data.data;
						
						if( constants.DEBUG ) 
							console.log( "submitSignup success", data );
							
						//    clear form
                        $scope.form.username = "";
                        $scope.form.password = "";
                        $scope.form.password_confirm = "";
                        $scope.form.name_first = "";
                        $scope.form.name_last = "";
                        
                        $scope.setStatus();
						$scope.userModel.status = "Your account was created. Please sign-in.";
						
						navigation.showPopup();
					},
					function(data, status, headers, config)
					{
						if( status == 500 )
							$scope.userModel.status = "There was an unspecified error registering. Please try again later.";
						
						console.log( status );
					}
				);
			};
			
			$scope.submitEditProfile = function()
			{
				$scope.setStatus();
				
				var data = userModel.user.profile;
				
				$scope.userService.submitEditProfile
				(
					data,
					function(data)
					{
						if( constants.DEBUG ) 
							console.log( "submitEditProfile success", data );
						
						$scope.userModel.user = data;
						$scope.userModel.message = "Your profile has been updated.";
						$scope.safeApply();
					},
					function(data)
					{
						$scope.showError( data.error );
					}
				);
			};
			
			$scope.checkUsername = function()
			{
				$scope.setStatus();
				
				var data = {username:$scope.form.username};
				
				$scope.userService.checkUsername
				(
					data,
					function( data )
					{	
						$scope.usernameIsUnique = false;
						$scope.safeApply();
						
						if( constants.DEBUG ) 
							console.log( 'checkUsername success', data, $scope.usernameIsUnique );
					},
					function( data )
					{
						$scope.usernameIsUnique = true;
					}
				);
			};
			
			$scope.safeApply = function()
			{
				var phase = this.$root.$$phase;
				if( phase == "$apply" || phase == "$digest" ) return;
				
				this.$apply();		
			};
			
			$scope.showError = function( error )
 			{
			    $scope.setStatus(error);
 				
 				if( constants.DEBUG ) console.log( error );
 			};
 			
 			if( !userModel.initialized )
 			{
 				userModel.initialized = true;
 				
 				$scope.getSession().then
 				(
 					function()
 					{
 						if( !$scope.model.loggedIn )
 	 						$scope.checkUsername();
 					}
 				);
 			}
		}
	 ]
);