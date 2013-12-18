function Medication( _id, name, code, isBrand, manufacturer, kind )
{
	this._id = _id;
	this.name = name; 	//Value
	this.code = code;	//CodeableConcept
	this.isBrand = isBrand;	//Value
	this.manufacturer = manufacturer;	//ResourceReference
	this.kind = kind;
}