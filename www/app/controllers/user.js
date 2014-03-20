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
			
			$scope.form = {};
			$scope.usernameIsUnique = true;
			$scope.loading = false;
			
			var initSession = function(data)
			{
				console.log( data )
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
						
						if( data.user )
							initSession(data);
					},
					function(data, status, headers, config)
					{
						if( status == 440 )
							$scope.userModel.status = "Your session has expired. Please login.";
					}
				);
			};
			
			$scope.submitLogin = function()
			{
				$scope.setStatus();
				
				angular.forEach
				(
					[
					 	{field:'username',message:'an email'},
						{field:'password',message:'a password'}
					 ],
					function(item)
					{
						if( !$scope.status
							&& !$scope.form[item.field] ) 
						{
							$scope.setStatus("Please enter a " + item.message);
						}
					}
				);
				
				if( $scope.status )
					return;
				
				var data = {username:$scope.form.username,password:$scope.form.password};
				
				$scope.loading = true;
				
				$scope.userService.submitLogin
				(
					data,
					function(data, status, headers, config)
					{
						$scope.loading = false;
						
						if( constants.DEBUG ) 
							console.log( "submitLogin success", data, status, headers, config );
						
						initSession(data);
					},
					function(data, status, headers, config)
					{
						$scope.loading = false;
						
						if( status == 404 )
							$scope.userModel.status = "Invalid email/password combination";
					}
				);
			};
			
			$scope.submitLogout = function()
			{
				$scope.setStatus();
						
				if( $scope.status )
					return;
				
				var data = {};
				
				$scope.loading = true;
				
				$scope.userService.submitLogout
				(
					data,
					function(data, status, headers, config)
					{
						$scope.loading = false;
						
						if( constants.DEBUG ) 
							console.log( "submitLogout success", data, status, headers, config );
						
						deleteSession(data);
					},
					function(data, status, headers, config)
					{
						$scope.loading = false;
						
						if( status == 404 )
							$scope.userModel.status = "Invalid email/password";
					}
				);
			};
			
			
			$scope.submitSignup = function()
			{
				$scope.setStatus();
				
				if( !$scope.usernameIsUnique )
					$scope.setStatus("Oops, that email is already registered!");
				
				if( !$scope.status )
				{
					angular.forEach
					(
						[
						 	{field:'username',message:'an email'},
							{field:'password',message:'a password'},
							{field:'password_confirm',message:'a password confirmation'},
							{field:'name_first',message:'a first name'},
							{field:'name_last',message:'a last name'}
						 ],
						function(item)
						{
							if( !$scope.status
								&& !$scope.form[item.field] ) 
							{
								$scope.setStatus("Please enter " + item.message);
							}
						}
					);
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
				
				if( !data.username )
				{
					$scope.usernameIsUnique = true;
					return;
				}
				
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
