app.factory
(
	'utilities',
	[
	 	function()
	 	{
	 		return {
	 			
	 			sortByDate: function(a,b) {
	 				return a.date-b.date;
	 			}
	 		}
	 	}
	 ]
)