function CodeableConcept( coding, text, primary )
{
	this.coding = coding;	//array<Coding>
	this.text = text || {};		//value
	this.primary = primary || {};	//value
}