app.factory
(
	'factory',
	[
	 	'constants',
	 	function(constants)
	 	{
	 		return {
	 			
	 			patient: function(id)
	 			{
	 				return {
	 					
	 					id: id,
	 					_trackers: null,
	 					
	 					
	 					getTracker: function( type )
	 					{
	 						if( !type ) 
	 							return this.trackers;
	 						
	 						var trackers = [];
	 						
	 						for(var i=0;i<this._trackers.length;i++)
	 							if( this._trackers[i].name == type )		//	keying off label, should be code
	 								trackers.push( this._trackers[i] );
	 						
	 						//	sort by date
	 						trackers.sort(function(a,b){return a.date-b.date;});
	 						
	 						return trackers;
	 					},
	 					
	 					getTrackers: function()
	 					{
	 						return this._trackers;
	 					},
	 					
	 					setTrackers: function( trackers )
	 					{
	 						this._trackers = trackers;
	 					},
	 					
	 					getVitals: function()
	 					{
	 						return this._vitals;
	 					},
	 					
	 					setVitals: function( vitals )
	 					{
	 						this._vitalsCache = {};
	 						this._vitals = vitals;
	 					}
	 				};
	 			}
	 		};
	 	}
	 ]
);