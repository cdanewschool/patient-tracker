function Constants()
{
	this.DEBUG = true;
	this.MONTHS_ABBR = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sept","Oct","Nov","Dec"];
	this.REST_URL = "http://ar210.piim.newschool.edu:8888/";
	
	//		code system urls
	this.LOINC_URL = "http://loinc.org";
	this.HL7_URL = "http://hl7.org/fhir/";
	this.SNOMED_URL = "http://snomed.info";
	this.UNITS_URL = "http://unitsofmeasure.org";
	
	this.COLOR_PATIENT = "green";
	this.COLOR_PROVIDER = "blue";

	this.REPORTER_PATIENT = "patient";
	this.REPORTER_PROVIDER = "provider";
	
	//		simple types
	this.VITAL_TYPE_BODY_MASS_INDEX = "bodymassindex";
	this.VITAL_TYPE_BLOOD_PRESSURE_DIASTOLIC = "diastolic";
	this.VITAL_TYPE_BLOOD_PRESSURE_SYSTOLIC = "systolic";
	this.VITAL_TYPE_HEIGHT = "height";
	this.VITAL_TYPE_HEART_RATE = "heartrate";
	this.VITAL_TYPE_RESPIRATORY_RATE = "respiratoryrate";
	this.VITAL_TYPE_BODY_TEMPERATURE = "bodytemperature";
	this.VITAL_TYPE_WEIGHT = "weight";

	//		compound types
	this.VITAL_TYPE_BLOOD_PRESSURE = "bloodpressure";
}

