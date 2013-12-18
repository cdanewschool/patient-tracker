function MedicationDosage( dosageTiming, dosageSite, dosageRoute, dosageMethod, dosageQuantity, dosageRate, dosageMaxDosePerPeriod)
{	
    this.timing = dosageTiming || {}; //Schedule
	this.site = dosageSite || {}; //codeable concept
	this.route = dosageRoute || {}; //codeable concept
	this.method = dosageMethod || {}; // codeable concept
	this.quantity = dosageQuantity || {}; // Quantity
	this.rate = dosageRate || {}; //Ratio
	this.maxDosePerPeriod = dosageMaxDosePerPeriod || {}; //Ratio
}