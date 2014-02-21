function ResourceReference( display, reference, type )
{
	if( typeof display != 'undefined' )
		this.display = display;		//@Value
	
	if( typeof reference != 'undefined' )
		this.reference = reference;			//@Value
	
	if( typeof type != 'undefined' )
		this.type = type;			//@Value
}