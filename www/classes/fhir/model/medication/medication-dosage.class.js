function MedicationDosage( timing, site, route, method, quantity, rate, maxDosePerPeriod)
{	
	if( typeof timing != 'undefined' )
		this.timing = timing;		 					//Schedule
	
	if( typeof site != 'undefined' )
		this.site = site;								// codeable concept
	
	if( typeof route != 'undefined' )
		this.route = route;								// codeable concept
	
	if( typeof method != 'undefined' )
		this.method = method;							// codeable concept
	
	if( typeof quantity != 'undefined' )
		this.quantity = quantity;						//Quantity
	
	if( typeof rate != 'undefined' )
		this.rate = rate;								//Ratio
	
	if( typeof maxDosePerPeriod != 'undefined' )
		this.maxDosePerPeriod = maxDosePerPeriod;		//Ratio
}