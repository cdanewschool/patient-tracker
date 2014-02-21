function Quantity( value, units, system, code )
{
	if( typeof value != 'undefined' )
		this.value = value;
	
	if( typeof units != 'undefined' )
		this.units = units;
	
	if( typeof system != 'undefined' )
		this.system = system;
	
	if( typeof code != 'undefined' )
		this.code = code;
}