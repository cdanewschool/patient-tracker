app.directive
(
	'trackerChart',
	function(utilities)
	{
		return {
			restrict:"E",
			templateUrl:'partials/directive/tracker-chart.html',
			scope:{
				timespans: "=",
				records: "=",
				yAxisLabel: "=",
				chartType: "="
			},
			link:function(scope,element,attrs)
			{
				var colors = new Array("rgba(255,255,255,1)","rgba(159,215,221,1)");
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
					
					var data = { labels : labels, datasets: datasets };
					var options = { animation: false, bezierCurve: false, datasetFill: false, pointDotRadius: 5, scaleShowGridLines:false, scaleLineColor: "rgba(135,135,135,1)" };
					
					var chart = angular.element(element).find("#chartContainer").highcharts({
						chart: {
							backgroundColor: '#000000',
							type: scope.chartType
						},
						title: {
							text: null
						},
						rangeSelector: {
							inputEnabled: false
						},
						xAxis: {
							type: 'datetime',
							dateTimeLabelFormats: {
								second: '%Y-%m-%d<br/>%H:%M:%S',
								minute: '%Y-%m-%d<br/>%H:%M',
								hour: '%Y-%m-%d<br/>%H:%M',
								day: '%m/%d',
								//week: '%Y<br/>%m-%d',
								week: '%b %e, %Y',
								month: '%Y-%m',
								year: '%Y'
							},
							plotLines: [{
								color: 'rgba(0, 173, 238, .3)',
								width: '2',
								value: new Date().getTime()			
							}]
						},
						yAxis: {
							title: {
								text: scope.yAxisLabel
							},
							labels: {
								enabled: scope.chartType != 'scatter'		//if the chart is a scatter chart (for medications), disable the y-Axis labels.
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
