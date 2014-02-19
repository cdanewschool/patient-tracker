app.directive
(
	'trackerChart',
	function(utilities)
	{
		return {
			restrict:"E",
			templateUrl:'partials/directive/tracker-chart.html',
			scope:{
				chartType: "=",
				className: "=",
				timespans: "=",
				timespanEnabled: "=",
				records: "=",
				xaxisEnabled: "=",
				yAxisLabel: "=",
				yaxisEnabled: "="
			},
			link:function(scope,element,attrs)
			{
				var chart;
				
				var update = function()
				{
					if( !scope.timespan ) return;
					
					if( scope.className )
						angular.element(element).find("#chartContainer").addClass( scope.className );
					
					var series = new Array();
					
					angular.forEach
					(
						scope.records,
						function(record)
						{
							if( !series[0] )
								series[0] = {data:new Array(),name: record.name};
							
							if(!record.medicationId) {																			//if the record IS NOT A MEDICATION
								if(record.values.length == 1)																	//we add the date for the X-AXIS, and the record's VALUE for the Y-AXIS
									series[0].data.push( [record.date, record.values[0].values[0]] );								
								else
									series[0].data.push( [record.date, record.values[0].values[0], record.values[1].values[0]] );		//if there is more than one value (Blood Pressure has two), we add both values	
							}
							else 																								//if the record IS A MEDICATION
								series[0].data.push( [record.date, record.index] );												//we add the date for the X-AXIS, and the record's INDEX for the Y-AXIS
						}
					);
					
					if( chart )
					{
						for(var s in chart.series)
							chart.series[s].setData( series[s] );
					}
					else
					{
						chart = angular.element(element).find("#chartContainer").highcharts({
							chart: {
								backgroundColor: 'rgba(255,255,255,0.002)',
								type: scope.chartType
							},
							title: {
								text: null
							},
							rangeSelector: {
								inputEnabled: false
							},
							xAxis: {
								gridLineWidth: 0,
								lineWidth: (scope.xaxisEnabled!==false?1:0),
								minorGridLineWidth: (scope.xaxisEnabled!==false?1:0),
								minorTickWidth: 0,
								tickWidth: (scope.xaxisEnabled!==false?1:0),
								type: 'datetime',
								dateTimeLabelFormats: {
									second: '%Y-%m-%d<br/>%H:%M:%S',
									minute: '%Y-%m-%d<br/>%H:%M',
									hour: '%Y-%m-%d<br/>%H:%M',
									day: '%m/%d',
									week: '%b %e, %Y',
									month: '%Y-%m',
									year: '%Y'
								},
								plotLines: [{
									color: 'rgba(0, 173, 238, .3)',
									width: '2',
									value: new Date().getTime()			
								}],
								labels: {
									enabled: scope.xaxisEnabled!==false
								}
							},
							yAxis: {
								gridLineWidth: 0,
								lineWidth: (scope.xaxisEnabled!==false?1:0),
								minorGridLineWidth: (scope.yaxisEnabled!==false?1:0),
								minorTickWidth: 0,
								tickWidth: (scope.yaxisEnabled!==false?1:0),
								title: {
									text: scope.yAxisLabel
								},
								labels: {
									enabled: scope.yaxisEnabled!==false && scope.chartType != 'scatter'		//if the chart is a scatter chart (for medications), disable the y-Axis labels.
								},
								tickInterval: scope.chartType == 'scatter' ? 1 : null
							},
							plotOptions: {
								series: {
									allowPointSelect: true,
									marker: {
										radius: scope.chartType == 'scatter' ? 8 : 3
									}
								}
							},
							series: series,
							tooltip: 
							{
								shared:true,
								formatter: function() {
									if(scope.chartType == 'arearange')		//for Blood Pressure
										return '<b>' + this.points[0].point.low + '/' + this.points[0].point.high + '</b> on ' + Highcharts.dateFormat('%b %e', this.x);		//'<span style="font-size: 10px">' + Highcharts.dateFormat('%B %e, %Y', this.x) + '</span><br/>' + this.points[0].series.name + ': <b>' + this.points[0].point.low + '/' + this.points[0].point.high + '</b>';
									else if(scope.chartType == 'line')		//for other Vitals or custom trackers
										return this.points[0].series.name + ' was <b>' + this.y + '</b> on <b>' + Highcharts.dateFormat('%m/%e', this.x) + '</b>';		//<span style="font-size: 10px">' + Highcharts.dateFormat('%B %e, %Y', this.x) + '</span><br/>' + this.points[0].series.name + ': <b>' + this.y + '</b>';
									else if(scope.chartType == 'scatter')	//for Medications
										return '<span style="font-size: 10px; font-style:italic;">' + this.series.name + '</span><br />Intake <b>#' + this.y + '</b> on <b>' + Highcharts.dateFormat('%m/%e', this.x) + '</b>';
								},
							},
							legend: {
								enabled: false
							},
							exporting: {
								enabled: false
							},
							credits: {
								enabled: false
							}
						});
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
						if( newVal != oldVal )
						{
							var recordsIndexed = [];
							
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
									
									//	ensure date is a timestamp
									if( typeof record.date == "object" ) 
										record.date = record.date.getTime();
									
									// if the record is for a medication, we add an INDEX to the record, representing how many times this medication was taken on a given day (so we can display it accordingly on the chart)
									if(record.medicationId) {
										var key = date.getTime();
										if(!recordsIndexed[key]) recordsIndexed[key] = [];
										recordsIndexed[key].push(record);		//add the record to the *key* index in the recordsIndexed array, so we can then get the recordsIndexed[key].length 
										record.index = recordsIndexed[key].length;
									}
								}
							);
							
							update();
						}
						
					}
				);
			}
		};
	}
);
