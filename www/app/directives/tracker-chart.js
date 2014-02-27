app.directive
(
	'trackerChart',
	function(utilities,constants)
	{
		return {
			restrict:"E",
			templateUrl:'partials/directive/tracker-chart.html',
			scope:{
				chartType: "=",
				className: "=",
				definition: "=",
				maxDate: "=",
				minDate: "=",
				timespans: "=",
				timespanEnabled: "=",
				onDatumSelect:"&select",
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
								series[0] = {
												data:new Array(),
												name: record.name, 
												marker: {
													radius: scope.chartType == constants.CHART_TYPE_SCATTER ? 8 : 4,
													fillColor: scope.chartType == constants.CHART_TYPE_SCATTER ? 'rgba(151, 206, 29, 1)' : '#000',
													lineWidth: 2,
													lineColor: null		//inherit from series
												}
											};
							if( !series[1] )
								series[1] = {
												data:new Array(),
												name: 'Not taken', 
												marker: {
													symbol: 'circle',
													radius: scope.chartType == constants.CHART_TYPE_SCATTER ? 8 : 4,
													fillColor: '#000',
													lineWidth: 2,
													lineColor: null		//inherit from series
												}
											};
							
							if( scope.chartType == constants.CHART_TYPE_SCATTER ) 														
							{
								//var taken = record.taken;
								if(record.taken) series[0].data.push( [record.date, record.index] );					//we add the date for the X-AXIS, and the record's INDEX for the Y-AXIS
								else 			 series[1].data.push( [record.date, record.index] );
							} 
							else if( scope.chartType == constants.CHART_TYPE_BUBBLE
									&&  record.values.length ) 
							{
								series[0].data.push( [record.date, 0, record.values[0].values[0]] );	
							} 
							else if( record.values.length )
							{
								if(record.values.length == 1)																		//we add the date for the X-AXIS, and the record's VALUE for the Y-AXIS
									series[0].data.push( [record.date, record.values[0].values[0]] );								
								else
									series[0].data.push( [record.date, record.values[0].values[0], record.values[1].values[0]] );	//if there is more than one value (Blood Pressure has two), we add both values	
							}
						}
					);
					
					console.log('My series: ' + JSON.stringify(series[0]));
					
					if( chart )
					{
						for(var s in chart.series)
							chart.series[s].setData( series[s] );
					}
					else
					{
						chart = angular.element(element).find("#chartContainer").highcharts('StockChart', {
							chart: {
								backgroundColor: 'rgba(255,255,255,0.002)',
								type: scope.chartType
							},
							title: {
								text: null
							},
							rangeSelector: {
								inputEnabled: false,
						    	buttons: scope.xaxisEnabled!==false?[{
						    		type: 'week',
						    		count: 1,
						    		text: '1w'
						    	}, {
						    		type: 'month',
						    		count: 1,
						    		text: '1m'
						    	}, {
						    		type: 'month',
						    		count: 6,
						    		text: '6m'
						    	}, {
						    		type: 'year',
						    		count: 1,
						    		text: '1y'
						    	}, {
						    		type: 'ytd',
						    		text: 'YTD'
						    	}, {
						    		type: 'all',
						    		text: 'All'
						    	}]:[],
						    	selected: 5,
								buttonTheme: { // styles for the buttons
						    		fill: 'none',
						    		stroke: 'none',
						    		'stroke-width': 0,
						    		r: 0,
						    		style: {
						    			fontSize:9,
						    			color: 'rgba(151, 206, 29, .8)',
						    			fontWeight: 'bold'
						    		},
						    		states: {
						    			hover: {
						    				fill: 'none',
						    				style: {
						    					color: 'white'
						    				}
						    			},
						    			select: {
						    				fill: 'rgba(151, 206, 29, .8)',
						    				style: {
						    					color: 'white'
						    				}
						    			}
						    		}
						    	},
						    	buttonSpacing: -1,
						    	labelStyle: {
						    		fontSize: 9,
						    		color: 'silver'
						    	}
							},
							navigator: {
						    	enabled: false
						    },
						    scrollbar: {
						    	enabled: false
						    },
							xAxis: {
								lineWidth: (scope.xaxisEnabled!==false?1:0),
								lineColor: '#444',
								gridLineWidth: (scope.xaxisEnabled!==false?1:0),
								gridLineColor: '#222',
								tickWidth: (scope.xaxisEnabled!==false?1:0),
								tickColor: '#222',
								type: 'datetime',
								max: scope.maxDate ? scope.maxDate : null,
								min: scope.minDate ? scope.minDate : null,
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
									enabled: scope.xaxisEnabled!==false,
									style: {
										fontSize: 9,
										color: '#808080'
									}
								},
								ordinal: false
							},
							yAxis: {
								lineWidth: (scope.yaxisEnabled!==false?1:0),
								lineColor: '#444',
								gridLineWidth: (scope.yaxisEnabled!==false?1:0),
								tickWidth: (scope.yaxisEnabled!==false?1:0),
								tickColor: '#222',
								title: {
									text: scope.yAxisLabel,
									style: {
										color: '#808080'
									}
								},
								labels: {
									enabled: scope.yaxisEnabled!==false && scope.chartType != constants.CHART_TYPE_SCATTER && scope.chartType != constants.CHART_TYPE_BUBBLE,		//if the chart is a scatter chart (for medications), disable the y-Axis labels.
									style: {
										fontSize: 9,
										color: '#808080'
									},
									align: 'right',
									x:-8,
									y:3
								},
								tickInterval: scope.chartType == constants.CHART_TYPE_SCATTER ? 1 : null
							},
							plotOptions: {
								series: {
									allowPointSelect: true,
									lineWidth: scope.chartType == constants.CHART_TYPE_SCATTER ? 0 : 4,
									color: 'rgba(151, 206, 29, .6)',
									point: {
					                    events: {
					                        click: function(){ var point = this; scope.onDatumSelect({point: point}); }
					                    }
					                }
								}
							},
							series: series,
							tooltip: 
							{
								shared:true,
								formatter: function() {
									if(scope.chartType == constants.CHART_TYPE_AREARANGE)		//for Blood Pressure
										return '<b>' + this.points[0].point.low + '/' + this.points[0].point.high + '</b> on ' + Highcharts.dateFormat('%b %e', this.x);
									else if(scope.chartType == constants.CHART_TYPE_LINE)		//for other Vitals or custom trackers
										return this.points[0].series.name + ' was <b>' + this.y + '</b> on <b>' + Highcharts.dateFormat('%m/%e', this.x) + '</b>';
									else if(scope.chartType == constants.CHART_TYPE_SCATTER) {	//for Medications
										var takenString = this.series.name != "Not taken" ? 'Intake <b>#' + this.y : '<b>Not taken';
										return takenString + '</b> on <b>' + Highcharts.dateFormat('%m/%e', this.x) + '</b>';			//'<span style="font-size: 10px; font-style:italic;">' + this.series.name + '</span><br />' + 	
									}
									else if(scope.chartType == constants.CHART_TYPE_BUBBLE)
									{
										var label = null;
										
										if( scope.definition 
											&& scope.definition.components
											&& scope.definition.components.length )
										{
											label = scope.definition.components[0].values[this.point.z].label;
										}
										
										return this.point.series.name + ' was <b>' + label + '</b> on <b>' + Highcharts.dateFormat('%m/%e', this.x) + '</b>';
									}
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
						Highcharts.setOptions({
							lang: {
								rangeSelectorZoom:scope.xaxisEnabled!==false?'Zoom':''
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
							var recordsIndexed = new Array();
							
							//	records are in reverse chronological order by default (most-recent first)
							var records = newVal.slice().sort( utilities.sortByDate );
							
							angular.forEach
							(
								records,
								function(record)
								{
									var date = new Date();
									date.setTime( record.date );
									date.setUTCHours(0, 0, 0, 0);
									
									//	ensure date is a timestamp
									if( typeof record.date == "object" ) 
										record.date = record.date.getTime();
									
									// if the record is for a medication, we add an INDEX to the record, representing how many times this medication was taken on a given day (so we can display it accordingly on the chart)
									if(record.medicationId) {
										record.date = date.getTime();	//set time to 0:00, so all points in the medications's chart are displayed vertically
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
