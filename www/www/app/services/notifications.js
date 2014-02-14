app.factory
(
	'notificationsService',
	[
	 	'$window','model',
	 	function($window,model)
	 	{
	 		return {
	 			
	 			add: function(id,name,frequency,repeatUnit,repeatUnitDetail)
	 			{
	 				var dates = new Array();
	 				var repeat;
	 				
	 				if( repeatUnit == "h" )
	 				{
	 					for(var i=0;i<frequency;i++)
	 					{
	 						if( typeof repeatUnitDetail[i] != 'number' )
	 							throw new Error("Error");
	 						
	 						var date = new Date();
	 						date.setHours( date.getHours() + 1 );	//	start next hour
	 						date.setMinutes( repeatUnitDetail[i] );	
	 						date.setSeconds(0);
	 					}
	 					
	 					repeat = "hourly";
	 				} 
	 				else if( repeatUnit == "d" )
	 				{
	 					repeat = "daily";
	 					
	 					for(var i=0;i<frequency;i++)
	 					{
	 						if( typeof repeatUnitDetail[i] != 'string' )
	 							throw new Error("Error");
	 						
	 						var time = repeatUnitDetail[i].split(":");
	 						
	 						var date = new Date();
	 						date.setDate( date.getDate() + 1 );	//	start tomorrow
	 						date.setHours( time[0] );
	 						date.setMinutes( time[1] );
	 						date.setSeconds(0);
	 					}
	 				}
	 				else if( repeatUnit == "wk" )
	 				{
	 					repeat = "weekly";
	 					
	 					for(var i=0;i<frequency;i++)
	 					{
	 						if( typeof repeatUnitDetail[i] != 'object' )
	 							throw new Error("Error");
	 						
	 						var time = repeatUnitDetail[i].time.split(":");
	 						
	 						var date = new Date();
	 						date.setDay( repeatUnitDetail[i].day );
	 						date.setHours( time[0] );
	 						date.setMinutes( time[1] );
	 						date.setSeconds(0);
	 					}
	 				}
	 				else if( repeatUnit == "mo" )
	 				{
	 					repeat = "monthly";
	 				}
	 				
	 				for(var i=0;i<dates;i++)
 					{
	 					var date = dates[i];
 						var notificationId = id + "_" + i;
 						
 						console.log( notificationId, date );
 						
 						if( !$window.plugin ) continue;
 						
 						$window.plugin.notification.local.add
 	 					(
 	 						{
 	 							id: notifcationId,
 	 							date: date,
 	 							message: "Time to record your " + name,
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
 						
 						if( !$window.plugin ) continue;
 						
 						$window.plugin.notification.local.cancel(notificationId);
 					}
	 			}
	 		};
	 	}
	 ]
);
