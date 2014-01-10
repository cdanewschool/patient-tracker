//	see http://omnipotent.net/jquery.sparkline

app.directive
(
	'sparkline', 
	function($parse,$rootScope)
	{
	    return {
	        restrict : 'E',
	        
	        link : function(scope, element, attrs)
	        {
	        	var model = $parse(attrs.ngModel);
	        	
	        	var render = function()
	        	{
	        		var options = 
	        		{
	        			composite: false,
	        			disableHiddenCheck:true,
	        			fillColor:false,
	        			height:'20px',
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
	        		
	        		angular.element(element).sparkline(model(scope),options);
	        	};
	        	
	        	scope.$watch
	        	(
	        		attrs.ngModel, 
	        		function(newVal, oldVal)
	        		{
	        			if( newVal != oldVal )
	        			{
	        				render();
	        			}
	        	    }
	        	);
	        }
	    };
	}
);