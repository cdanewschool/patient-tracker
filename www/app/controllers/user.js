app.factory
(
	"userModel",
	[
		"model",
	 	function()
	 	{
	 		return {
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

			$scope.setStatus = function(status)
			{
				status = status || null;
				
				$scope.status = status;
				
				if( $scope.status )
					$scope.userModel.status = null;
			};
			
			$scope.getSession = function()
			{
				var data = {token:window.localStorage.getItem("token")};
				
				$scope.userService.getSession
				(
					data,
					function(data, status, headers, config)
					{
						if( constants.DEBUG ) 
							console.log( "getSession success", data );
						
						$scope.userModel.userId = data.id;
						$scope.userModel.user = data.user;
						
						$scope.model.token = data.token;
						$scope.model.loggedIn = true;
						
						$rootScope.$emit('authenticateSuccess');
					},
					function(data, status, headers, config)
					{
						if( status == 404 )
							$scope.showError( "Invalid username/password" );
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
						
						window.localStorage.setItem("token", data.token);
						
						$scope.userModel.userId = data.id;
						$scope.userModel.user = data.user;
						
						$scope.model.token = data.token;
						$scope.model.loggedIn = true;
						
						$rootScope.$emit('authenticateSuccess');
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
						
						$scope.showPopup("login");
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
						$scope.usernameIsUnique = (data.entries.length == 0);
						$scope.safeApply();
						
						if( constants.DEBUG ) 
							console.log( 'checkUsername success', data, $scope.usernameIsUnique );
					},
					function( data )
					{
						
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
 			
 			if( !$scope.model.loggedIn )
 				$scope.getSession();
		}
	 ]
);