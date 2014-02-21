function CodeableConcept( coding, text, primary )
{
	if( typeof coding != 'undefined' )
		this.coding = coding;		//array<Coding>
	
	if( typeof text != 'undefined' )
		this.text = text;		//value
	
	if( typeof primary != 'undefined' )
		this.primary = primary;		//value
}