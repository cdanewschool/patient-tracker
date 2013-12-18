app.directive
(
	'highchart', 
	function($timeout,model,vitalsModel,constants)
	{
	    return {
	        restrict : 'A',
	        
	        link : function(scope, element, attrs)
	        {
	    		var chart;	//	reference to the created chart
	    		var vital = scope[ attrs.ngModel ];	//	definition
	    		
	    		var size = function()
	    		{
	    			//	don't bother refreshing if this vital is not visible
	    			if( vitalsModel.selectedVitalId != vital.id ) return;
	    			
	    			var w = $(window).width();
	    			var h = $(window).height();
	    			
	    			//	subtract header/footer from height
	    			var header = $(element).closest("div[data-role='page']").find("div[data-role='header']");
	    			var footer = $(element).closest("div[data-role='page']").find("div[data-role='footer']");
	    			
	    			if( header.length ) h -= $(header).height();
	    			if( footer.length ) h -= $(footer).height();
	    			
	    			$(element).highcharts().setSize( w, h, false );
	    		};
	    		
	    		//	delay resizing to 1/2 second after last update for performance
	    		var resize = function()
	    		{
	    			$timeout.cancel(scope.resizeDelay);
	    			
	        		scope.resizeDelay = $timeout(size,500);
	    		};
	        	
	    		var updateDisplayedTracker = function(trackerId,oldTrackerId)
	    		{
	    			trackerId = trackerId || vitalsModel.displayedTrackerId;
	    			
	    			if( trackerId == oldTrackerId ) return;
	    			
	    			oldTrackerId = oldTrackerId || trackerId;
	    			
	    			var tracker;
	    			
	    			//	remove axis/series for previously-displayed tracker
	    			if( oldTrackerId )
	    			{
	    				tracker = getTrackerDefinitionByID(oldTrackerId);
	    				
						//	remove tracker-related axes/series
						if( chart.get('axis-'+tracker.id) ) 
							chart.get('axis-'+tracker.id).remove(false);
						
						if( chart.get('series-'+tracker.id) ) 
							chart.get('series-'+tracker.id).remove(false);
	    			}
	    			
	    			if( trackerId == null ) 
	    			{
	    				chart.redraw();
	    				return;
	    			}
	    			
	    			tracker = getTrackerDefinitionByID(vitalsModel.displayedTrackerId);
	    			
					var data = tracker.data;
					
					if( data 
						&& data.length > 0 )
					{
						chart.addAxis
						(
							{
								id: 'axis-' + tracker.id,
								alignTicks: true,
								min:tracker.min || 0,
								max:tracker.max,
								title:{text:tracker.label + " (" + tracker.unitLabel + ")"}, 
								tickInterval:Math.floor(tracker.max/4),
								style:{color:"#AA4643"}, 
								opposite: true 
							},
							false, false 
						);
						
						chart.addSeries
						(
							{
								id: 'series-' + tracker.id,
								name: tracker.label, 
								color: '#AA4643', 
								data: tracker.data,
								yAxis: 'axis-' + tracker.id, 
								marker: { enabled: true }, 
								type: "line",
								valueSuffix: " " + tracker.unitLabel
							}, 
							false
						);
					};
					
					chart.redraw();
	    		}
	    		
	    		var updateTrackerData = function()
				{
	    			var tracker = getTrackerDefinitionByID(vitalsModel.displayedTrackerId);
	    			
	    			if( chart.get('series-'+tracker.id) )
	    			{
	    				chart.get('series-'+tracker.id).setData( tracker.data );
		    			chart.redraw();
	    			}
				};				

				var getTrackerDefinitionByID = function(id)
				{
					for( var i=0; i < vitalsModel.trackerDefinitions.length; i++) {
						var tracker = vitalsModel.trackerDefinitions[i];
						if( tracker.id == id )
							return tracker;
					}
					
					return null;
				};
				
	    		//	update the vitals axis when patient has been loaded
	    		//	TODO: store in a better place
	    		scope.$watch
	    		(
	    			'model.patient',
	    			function(newVal,oldVal)
	    			{
	    				if( newVal != oldVal && newVal != null )
	    					chart.yAxis[0].text = "";
	    			}
	    		);
	    		
	    		//	update chart data when it changes in model
	    		scope.$watch
	    		(
	    			'vital.data',
	    			function(newVal,oldVal)
	    			{
	    				if( newVal != oldVal )
	    					chart.series[0].setData( newVal );	//	TODO: reference series by id?
	    			}
	    		);
	    		
	    		//	update chart when the displayed tracker changes
	    		scope.$watch
	    		(
	    			'vitalsModel.displayedTrackerId',
	    			function(newVal,oldVal)
	    			{
	    				if( newVal != oldVal )
	    					updateDisplayedTracker(newVal,oldVal);
	    			}
	    		);
	    		
	    		scope.$watch
	    		(
	    			'vitalsModel.selectedTracker.data',
	    			function(newVal,oldVal)
	    			{
	    				if( newVal != oldVal )
	    					updateTrackerData();
	    			},true
	    		);
	    		
	    		$(document).on
	    		(
	    			'pageinit',
	    			function($scope)
					{
		    			var tooltip = function (point)
			 			{
		    				if( point.series.options.id == constants.VITAL_TYPE_BLOOD_PRESSURE )
			 					return '<span style="font-size: 10px">' + Highcharts.dateFormat('%B %Y', point.x) + '</span><br/>' + point.series.name + ': <b>' + point.point.high + '/' + point.point.low + '</b>';
			 				
			 				return '<span style="font-size: 10px">' + Highcharts.dateFormat('%B %Y', point.x) + '</span><br/>' + point.series.name + ': <b>' + (point.series.options.valuePrefix||"") + point.point.y + (point.series.options.valueSuffix||"") + '</b>';
			 			};
		        		
			 			chart = new Highcharts.StockChart
		        		(
		    				{
		    					id: vital.id,
		    					chart: { renderTo: element[0].id, reflow: false },
		    					rangeSelector: { selected: 5, inputEnabled: false },
		    					title: { text: vital.label },
		    					xAxis: 
		    					{
		    						dateTimeLabelFormats: 
		    						{
		    							second: '%Y-%m-%d<br/>%H:%M:%S',
		    							minute: '%Y-%m-%d<br/>%H:%M',
		    							hour: '%Y-%m-%d<br/>%H:%M',
		    							day: '%Y<br/>%m-%d',
		    							week: '%b %e, %Y',
		    							month: '%Y-%m',
		    							year: '%Y'
		    						},
		    						plotLines: 
		    						[
		    						 {
		    							color: 'rgba(0, 173, 238, .3)',
		    							width: '2',
		    							value: new Date().getTime()			
		    						 }
		    						]
		    					},
		    					yAxis: 
		    					{
		    						title: 
		    						{
		    							text: ""//'mmHg'*/
		    						}
		    					},
		    					plotOptions: { series: { allowPointSelect: vital.chart.allowPointSelect } },
		    					series: 
		    						[
		    						 {
		    							 id: vital.id,
		    							 name: 'My ' + vital.label,
		    							 data: vital.data,
		    							 lineWidth: 5,
		    							 marker: { enabled: vital.chart.markerEnabled },
		    							 type: vital.chart.type
		    						 }],
		    					tooltip: 
		    					{
		    						shared:true,
		    						valueSuffix: '',
		    						formatter: function() 
		    						{
		    							return tooltip(this.points[0]);
		    						}
		    					},
		    					credits: { enabled: false }
		    				}
		    			);
		        		
		        		$(window).resize(resize);
					}
	    		);
	    		
	    		$(document).on
	    		(
	    			'pageshow',
	    			function()
	    			{
	    				size();
	    				updateDisplayedTracker();
	    			}
	    		)
	        }
	    };
	}
);