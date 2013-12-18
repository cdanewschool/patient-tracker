function Patient( id )
{
	this.id = id;
	
	this.constants = new Constants();
	
	this._trackers;
	this._vitals;
	
	this._vitalsCache = {};
	
	this.getVitalUnit = function( type )
	{
		for(var i=0;i<this._vitals.length;i++)
			if( this._vitals[i].type == type )
				return this._vitals[i].unit;
		
		return null;
	};
	
	this.getVital = function( type )
	{
		if( !type ) 
			return this.vitals;
		
		if( this._vitalsCache[type] != undefined ) 
			return this._vitalsCache[type];
		
		var inputType = type;
		
		if( type == this.constants.VITAL_TYPE_BLOOD_PRESSURE ) 
			type = this.constants.VITAL_TYPE_BLOOD_PRESSURE_SYSTOLIC;
		
		var vitals = [];
		
		for(var i=0;i<this._vitals.length;i++)
			if( this._vitals[i].type == type )
				vitals.push( this._vitals[i] );
		
		if( inputType == this.constants.VITAL_TYPE_BLOOD_PRESSURE ) 
		{
			var vitals2 = this.getVitals( this.constants.VITAL_TYPE_BLOOD_PRESSURE_DIASTOLIC );
			
			for(var i=0;i<vitals2.length;i++)
				for(var j=0;j<vitals.length;j++)
					if( vitals[j].date == vitals2[i].date )
						vitals[j].value2 = vitals2[i].value;
		}
		
		//	sort by date
		vitals.sort(function(a,b){return a.date-b.date;});
		
		this._vitalsCache[type] = vitals;
		
		return vitals;
	};
	
	this.getTracker = function( type )
	{
		if( !type ) 
			return this.trackers;
		
		/*
		if( this._vitalsCache[type] != undefined ) 
			return this._vitalsCache[type];
		*/
		
		var trackers = [];
		
		for(var i=0;i<this._trackers.length;i++)
			if( this._trackers[i].name == type )		//	keying off label, should be code
				trackers.push( this._trackers[i] );
		
		//	sort by date
		trackers.sort(function(a,b){return a.date-b.date;});
		
		//this._trackerCache[type] = vitals;
		
		return trackers;
	};
	
	this.getTrackers = function()
	{
		return this._trackers;
	};
	
	this.setTrackers = function( trackers )
	{
		this._trackers = trackers;
	};
	
	this.getVitals = function()
	{
		return this._vitals;
	};
	
	this.setVitals = function( vitals )
	{
		this._vitalsCache = {};
		this._vitals = vitals;
	};
}