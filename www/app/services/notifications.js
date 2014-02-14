app.factory
(
	'notificationsService',
	[
	 	'$window','model',
	 	function($window,model)
	 	{
	 		var second = 1000;
	 		var minute = second * 60;
	 		var hour = minute * 60;
	 		var day = hour * 24;
	 		var week = day * 7;
	 		var month = day * 31;
	 		
	 		return {
	 			
	 			add: function(id,name,frequency,repeatUnit)
	 			{
	 				var now = new Date();
	 				
	 				var span;
	 				var repeat;
	 				
	 				if( repeatUnit == "h" )
	 				{
	 					repeat = "hourly";
	 					span = hour;
	 					
	 					now.setMinutes(0);
	 					now.setSeconds(0);
	 					now.setHours( now.getHours() + 1 );	//	start the following hour

	 				}
	 				else if( repeatUnit == "d" )
	 				{
	 					repeat = "daily";
	 					span = (18 - 8) * hour;	//	only notify between 8am-6pm
	 					
	 					//	start tomorrow at 8am
	 					now.setHours(8);
	 					now.setMinutes(0);
	 					now.setSeconds(0);
	 					now.setDate( now.getDate() + 1 );
	 				}
	 				else if( repeatUnit == "wk" )
	 				{
	 					repeat = "weekly";
	 					span = week;
	 					
	 					//	start whatever day of the week tomorrow is at noon
	 					now.setHours(12);
	 					now.setMinutes(0);
	 					now.setSeconds(0);
	 					now.setDate( now.getDate() + 1 );
	 				}
	 				else if( repeatUnit == "mo" )
	 				{
	 					repeat = "monthly";
	 					span = month;
	 					
	 					//	start next month on the 1st at noon
	 					now.setHours(12);
	 					now.setMinutes(0);
	 					now.setSeconds(0);
	 					now.setDate(0);
	 					now.setMonth( now.getMonth() + 1 );
	 				}
	 				
	 				for(var i=0;i<frequency;i++)
 					{
 						var date = new Date();
 						date.setTime( now.getTime() + (i*span/frequency) );
 						
 						var notificationId = id + "_" + i;
 						
 						console.log( notificationId, date, repeat );
 						
 						$window.plugin.notification.local.add
 	 					(
 	 						{
 	 							id: notifcationId,
 	 							date: date,
 	 							message: "Time to record your " + $scope.trackersModel.selectedTracker.label,
 	 							title: "Patient Tracker",
 	 							repeat: repeat
 	 						}
 	 					);
 					}
	 			},
	 			
	 			delete: function(id,frequency)
	 			{
	 				for(var i=0;i<frequency;i++)
 					{
 						var notificationId = id + "_" + i;
 						
 						$window.plugin.notification.local.cancel(notifcationId);
 					}
	 			}
	 		};
	 	}
	 ]
);
