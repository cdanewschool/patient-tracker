app.factory
(
	'popups',
	[
	 	function()
	 	{
	 		return {
	 			'signup': {controller:'UserCtrl'},
	 			'add-tracker': {controller:'AppCtrl'},
	 			'remove-tracker-confirm': {controller:'AppCtrl'}
	 		};
	 	}
	 ]
);

app.factory
(
	"navigation",
	[
	 	'$location','$modal','model','popups','constants',
		 function($location,$modal,model,popups,constants)
		 {
			 return {
				 
				 path: null,
				 popup: null,
				 model: model,
				 
				 setLocation: function(path)
			 	 {
					 this.showPopup();
					 
					 this.path = path;
					 
			 		 $location.path(path);
			 	 },
			 	
			 	 showPopup: function( id )
			 	 {
			 		 if( this.popup )
			 		 {
			 			this.popup.close();
		 				this.popup = null;
			 		 }
			 		 
			 		 if( !id ) return;
			 		 
			 		 var def = popups[id];
			 		 var self = this;
			 		 
			 		 this.popup = $modal.open
			 		 (
			 			{
			 				templateUrl: 'popups/' + id + '.html',
		 			    	controller: def.controller
		 				}
		 			);
			 		 
			 		this.popup.result.then
			 		(
			 			function () 
				 		{
				 		    self.popup = null;
				 		},
			 		    function () 
			 		    {
			 		    	self.popup = null;
			 		    }
			 		);
			 		
			 		return this.popup;
		 		},
			 	
			 	viewTracker: function(type,tracker)
		 		{
			 		model.tracker = tracker;
			 		
			 		this.setLocation('view/' + type + '/' + tracker);
		 		}
			};
		 }
	 ]
);