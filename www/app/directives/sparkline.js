//	see http://omnipotent.net/jquery.sparkline

app.directive
(
	'sparkline', 
	function($parse,$rootScope)
	{
		return {
	        restrict : 'E',
	        scope:{
	        	color:"=sparklineColor",
	            values:"@data"
	        },
	        compile: function(tElement,tAttrs,transclude)
	        {
	            return function(scope, element, attrs)
	            {
	            	var options = 
	        		{
	        			composite: false,
	        			disableHiddenCheck:false,
	        			fillColor:false,
	        			height:'auto',
	        			highlightLineColor:null,
	        			highlightSpotColor:null,
	        			lineColor:'#333333',
	        			lineWidth:1,
	        			maxSpotColor:false,
	        			minSpotColor:false,
	        			spotColor:false,
	        			tooltipFormat:'',
	        			width:'100%'
	        		};
	            	
	            	var render = function() 
	            	{
	            		var _options = _.defaults( {lineColor: '#' + scope.color}, options );
	            		
		        		if(attrs.sparklineMin)
		        			options.chartRangeMin = $parse(attrs.sparklineMin)(scope);
		        		
		        		if(attrs.sparklineMax)
		        			options.chartRangeMax = $parse(attrs.sparklineMax)(scope);
		        		
		        		if( options.chartRangeMin == options.chartRangeMax )
		        			options.chartRangeMax += 1;
		        		
		        		angular.element(element).sparkline($parse(scope.values)(scope),_options);
	            	};
	        		
	                scope.$watch
	                (
	                	"values", 
	                	function()
	                	{
	                		render();
	                	}
	                );
	                
	                scope.$watch
	                (
	                	"color", 
	                	function()
	                	{
	                		render();
	                	}
	                );
	                
	                $rootScope.$on
	                (
	                	'tabSelect',
	                	function()
	                	{
	                		$.sparkline_display_visible();
	                	}
	                );
	            };
	        }
	    };
	}
);