app.directive
(
	'lineChart',
	function(utilities)
	{
		return {
			restrict:"E",
			templateUrl:'partials/tracker-detail.html',
			scope:{
				timespans: "=",
				records: "="
			},
			link:function(scope,element,attrs)
			{
				var colors = new Array("rgba(255,255,255,1)","rgba(159,215,221,1)");
				var recordsIndexed = {};
				var chart;
				
				var datasetDefaults = 
					{
						fillColor : "rgba(220,220,220,0.5)",
						strokeColor : "rgba(220,220,220,1)",
						pointColor : "rgba(203,120,97,1)",
						pointStrokeColor : "#fff"
					};
				
				var update = function()
				{
					if( !scope.timespan ) return;
					
					var datasets = new Array();
					var labels = new Array();
					
					var span = scope.timespan.value * 7;
					
					var today = new Date();
					today.setHours(0, 0, 0, 0);
					
					var start = new Date();
					start.setDate( today.getDate() - span );
					start.setHours(0, 0, 0, 0);
					
					var labelCount = 5;
					
					for(var i=0;i<=span;i++)
					{
						var date = new Date( start.getTime() );
						date.setDate( start.getDate() + i );
						
						var recordsForDate = recordsIndexed[ date.getTime() ];
						
						//if( i == 0 || i == span-1 || i%Math.floor(span/labelCount) == 0 )
							labels.push( (date.getMonth()+1) + '/' + date.getDate() );
						
						angular.forEach
						(
							recordsForDate,
							function(record)
							{
								if( record.values.length )
								{
									angular.forEach
									(
										record.values,
										function(value,$index)
										{
											if( !datasets[$index] )
												datasets[$index] = _.defaults( {data:new Array(),strokeColor:colors[$index],pointStrokeColor:colors[$index]}, datasetDefaults );
											
											datasets[$index].data[i] = value.values[0];
										}
									);
								}
							}
						);
					}
					
					var data = { labels : labels, datasets: datasets };
					var options = { animation: false, bezierCurve: false, datasetFill: false, pointDotRadius: 5, scaleShowGridLines:false, scaleLineColor: "rgba(135,135,135,1)" };
					
					if( chart )
					{
						chart.Line( data, options );
					}
					else
					{
						chart = new Chart( element[0].firstChild.getContext("2d") );
						chart.Line( data, options );
					}
				};
				
				scope.$watch
				(
					'timespan',
					function()
					{
						update();
					}
				);
				
				scope.$watchCollection
				(
					'timespans',
					function(newVal,oldVal)
					{
						if( newVal != oldVal && newVal && !scope.timespan )
							scope.timespan = newVal[0];
					}
				);
				
				scope.$watchCollection
				(
					'records',
					function(newVal,oldVal)
					{
						recordsIndexed = {};
						
						//	records are in reverse chronological order by default (most-recent first)
						var records = newVal.slice().sort( utilities.sortByDate );
						
						angular.forEach
						(
							records,
							function(record)
							{
								var date = new Date();
								date.setTime( record.date );
								date.setHours(0, 0, 0, 0);
								
								record.dateString = date.toDateString();
								
								var key = date.getTime();
								
								if( !recordsIndexed[key] ) recordsIndexed[key] = [];
								
								recordsIndexed[key].push( record );
							}
						);
						
						console.log(recordsIndexed) 
						update();
					}
				);
			}
		};
	}
);
