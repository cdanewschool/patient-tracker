app.factory
(
	"navigation",
	[
	 	'$location','model','constants',
		 function($location,model,constants)
		 {
			 return {
				 
				 popup: null,
				 model: model,
				 
				 setLocation: function(path)
			 	{
			 		$location.path(path);
			 	},
			 	
		 		showPopup: function(id)
		 		{
		 			if( this.popup )
		 				angular.element('#' + this.popup).modal('hide');
		 			
		 			angular.element('#' + id).modal('show');
		 			
		 			this.popup = id;
		 		},
			 	
			 	viewTracker: function(type,id)
		 		{
		 			$location.path( 'view/' + type + '/' + id );
		 		}
		 		
				 /*
				 navigate: function( id )
				 {
					for( var p in this.model.pages )
						if( this.model.pages[p].id == id )
							options = this.model.pages[p].options;
					
					this.change( id, options );
				 },
				 
				 change: function( id, options )
				 {
					model.lastPage = $.mobile.activePage.attr('id');
					
					if( constants.DEBUG ) console.log( "Changing page", id, options );
					
					$.mobile.changePage( "#" + id, options );
				 },
				
				 last: function()
				 {
					 this.navigate( model.lastPage );
				 }
				 */
			};
		 }
	 ]
);