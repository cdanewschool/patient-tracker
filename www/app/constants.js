/**
 * Constants for the application
 */
app.factory
(
	"constants",
	[
	 	"ENV",
		function(ENV)
		{
			return { 
				DEBUG:ENV.DEBUG,
				MONTHS_ABBR: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sept","Oct","Nov","Dec"],
				
				HL7_URL:"http://hl7.org/fhir/",	//TODO: rename FHIR_URL
				SNOMED_URL: "http://snomed.info/sct",
				UNITS_URL: "http://unitsofmeasure.org",
				
				CONDITION_ALL: {name: 'All Trackers'},
				
				TITLE: "None",
				
				CHART_TYPE_AREARANGE: "arearange",
				CHART_TYPE_BUBBLE: "bubble",
				CHART_TYPE_LINE: "line",
				CHART_TYPE_SCATTER: "scatter",
				
				TYPE_MEDICATION: "medication",
				TYPE_TRACKER: "tracker",
				TYPE_VITAL: "vital"
			};
		}
	 ]
);