/**
 * TODO: make more generic, not medication specific
 * 
 * http://twitter.github.io/typeahead.js/
 */
app.directive
(
	'medicationsTypeahead',
	function($parse,model,medicationsModel,constants)
	{
		return {
			restrict: 'A',
			link: function(scope,element,attrs)
			{
				element.typeahead
				(
					{
						remote: 
						{
							beforeSend:function(jqXhr,settings){jqXhr.setRequestHeader('token',model.token);},
							cache:true,
							filter:function(response){ return response.entries.map(function(d){ return {label:d.content.Medication.name.value,value:d}; }); },
							name:"medications",
							timeout:250,
							url:constants.REST_URL + "medication/search?name=%QUERY"
						},
						minLength:1,
						limit:5,
						valueKey:"label"
					}
				).on
				(
					'typeahead:selected',
					function(e,datum)
					{
						var model = $parse(attrs.medicationsTypeahead);
						
						scope.$apply( function(){model.assign(scope, datum.value);});
					}
				);
			}
		};
	}
);