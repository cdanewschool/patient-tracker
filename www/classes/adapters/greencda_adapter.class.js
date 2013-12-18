function GreenCDAAdapter()
{
	this.constants = new Constants();
	
	this.parseVitals = function ( data, patient )
	{
		var vitals = [];
		
		for(var i=0;i<data.vitals.length;i++)
			vitals.push( this.parseVital( data.vitals[i] ) );
		
		patient.vitals = vitals;
		
		return patient;
	}
	
	this.parseVital = function ( data )
	{
		var time = data.effectiveTime.value;
		
		var vital = new Vital();
		
		vital.date = new Date( time.year, time.month-1, time.day, time.hour, time.minute, time.second ).getTime();
		vital.name = data.description;
		vital.unit = data.value.unit;
		vital.value = data.value.amount;
		
		if( vital.name == "BMI" )
			vital.type = this.constants.VITAL_TYPE_BODY_MASS_INDEX;
		else if( vital.name == "diastolic blood pressure" )
			vital.type = this.constants.VITAL_TYPE_BLOOD_PRESSURE_DIASTOLIC;
		else if( vital.name == "Ht." )
			vital.type = this.constants.VITAL_TYPE_HEIGHT;
		else if( vital.name == "Pulse" )
			vital.type = this.constants.VITAL_TYPE_PULSE;
		else if( vital.name == "Pulse Ox" )
			vital.type = this.constants.VITAL_TYPE_PULSE_OXYGEN;
		else if( vital.name == "Resp." )
			vital.type = this.constants.VITAL_TYPE_RESPIRATION;
		else if( vital.name == "systolic blood pressure" )
			vital.type = this.constants.VITAL_TYPE_BLOOD_PRESSURE_SYSTOLIC;
		else if( vital.name == "Temp." )
			vital.type = this.constants.VITAL_TYPE_TEMPERATURE;
		else if( vital.name == "Wt." )
			vital.type = this.constants.VITAL_TYPE_WEIGHT;
		
		return vital;
	}
}