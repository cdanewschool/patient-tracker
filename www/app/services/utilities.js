app.factory
(
	'utilities',
	[
	 	function()
	 	{
	 		var self = 
	 		{
	 			sortByDate: function(a,b) 
	 			{
	 				return a.date-b.date;
	 			},
	 			
	 			sortByLabel: function(a,b) 
	 			{
	 				return self._sortByString(a,b,'label');
	 			},
	 			
	 			sortByName: function(a,b)
				{
	 				return self._sortByString(a,b,'name');
				},
				
				_sortByString: function(a,b,prop)
				{
					var a = a[prop].toLowerCase().charAt(0);
					var b = b[prop].toLowerCase().charAt(0);
					
					if( a < b ) return -1;
					if( a > b ) return 1;
					
	 				return 0;
				}
	 		}
	 		
	 		return self;
	 	}
	 ]
)