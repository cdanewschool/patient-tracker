function Medication( _id, name, code, isBrand, manufacturer, kind )
{
	if( typeof _id != 'undefined' )
		this._id = _id;	
	
	if( typeof name != 'undefined' )
		this.name = name;		 					//Value
	
	if( typeof code != 'undefined' )
		this.code = code;		 					//Value
	
	if( typeof isBrand != 'undefined' )
		this.isBrand = isBrand;		 				//Value
	
	if( typeof manufacturer != 'undefined' )
		this.manufacturer = manufacturer;		 	//Value
	
	if( typeof kind != 'undefined' )
		this.kind = kind;		 					//Value
}