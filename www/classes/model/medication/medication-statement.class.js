function MedicationStatement(patient, whenGiven, medication, administrationDevice, dosage)
{
	this.identifier = {}; //Identifier TODO: define identifier per fhir if used
	this.patient = patient; //Patient
	this.wasNotGiven = {}; //boolean
	this.reasonNotGiven = {}; //codeable concept
	this.whenGiven = whenGiven; //Period
	this.medication = medication; //Resource(Medication)
	this.administrationDevice = administrationDevice; //Resource(Device)
	this.dosage = dosage; //medication.dosage 
	
}