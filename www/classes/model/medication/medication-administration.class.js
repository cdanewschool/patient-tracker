function MedicationAdministration(status, patient, medication, dosage, whenGiven, administrationDevice, practitioner, encounter )
{
    this.identifier = null; //Identifier TODO: define identifier per fhir if used
	this.status = status || {};
	this.patient = patient || {}; //Patient
	this.practitioner = practitioner || {}; //Practitioner
	this.encounter = encounter || {}; //Resource
	this.wasNotGiven = null; //boolean
	this.reasonNotGiven = null; //codeable concept
	this.whenGiven = whenGiven || {}; //Period
	this.medication = medication || {}; //Resource(Medication)
	this.administrationDevice = administrationDevice || {}; //Resource(Device)
	this.dosage = dosage || {}; //medication.dosage
}