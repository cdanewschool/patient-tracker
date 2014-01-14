//	see http://omnipotent.net/jquery.sparkline

app.directive
(
	'sparkline', 
	function($parse,$rootScope)
	{
		return {
	        restrict : 'E',
	        scope:{
	            values:"@data"
	        },
	        compile: function(tElement,tAttrs,transclude)
	        {
	            return function(scope, element, attrs)
	            {
	            	var render = function(vals) 
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
		        		
		        		if(attrs.sparklineMin)
		        			options.chartRangeMin = $parse(attrs.sparklineMin)(scope);
		        		
		        		if(attrs.sparklineMax)
		        			options.chartRangeMax = $parse(attrs.sparklineMax)(scope);
		        		
		        		angular.element(element).sparkline($parse(vals)(scope),options);
	            	};
	        		
	                scope.$watch
	                (
	                	"values", 
	                	function(values)
	                	{
	                		render(values);
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