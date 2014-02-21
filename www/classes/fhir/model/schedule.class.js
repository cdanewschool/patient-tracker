function Schedule(event,repeat)
{
	if( typeof event != 'undefined' )
		this.event = event;
	
	if( typeof repeat != 'undefined' )
		this.repeat = repeat;
}