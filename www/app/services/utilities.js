app.factory
(
	'utilities',
	[
	 	function()
	 	{
	 		return {
	 			
	 			sortByDate: function(a,b) {
	 				return b.date-a.date;
	 			}
	 		}
	 	}
	 ]
)