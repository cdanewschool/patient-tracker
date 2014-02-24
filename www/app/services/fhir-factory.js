app.factory
(
	'fhir-factory',
	[
	 	'vitalsModel','trackersModel','constants',
	 	function(vitalsModel,trackersModel,constants)
	 	{
	 		return {
	 			
	 			parseMedicationStatements: function( data )
	 			{
	 			    var medicationStatements = new Array();
	 				
	 				var entries = data.entries ? data.entries : data.entry;
	 		        
	 				for(var i=0;i<entries.length;i++)
	 				{	
	 				    var data = entries[i].content.MedicationStatement;
	 				    
	 				    var name = _.str.titleize(data.medication.display.value);
	 				    
		 				//	Because the FHIR spec has no provisions for specifying the code associated 
	 				    //	with its medication, we set `code` equal to the medication's id and use that
	 				    //	to key medicationstatements to conditions
	 				    
	 				    var m = new MedicationStatement();
	 				    m.id=entries[i].id.substr(entries[i].id.lastIndexOf('@')+1);
	 				   	m.code=data.medication.reference.value.substr(data.medication.reference.value.lastIndexOf('@')+1);
	 				    m.name=name;
	 				    m.type=constants.TYPE_MEDICATION;
	 				    m.asNeeded=data.dosage.asNeeded===true;
	 				    m.definition=
	 				    {
	 				    	label:name,
	 				    	components:
	 				    		[
	 				    		 	{
	 				    		 		id:"dosage",
	 				    		 		label:"Dosage",
	 				    		 		value:data.dosage && data.dosage.quantity ? data.dosage.quantity.value.value : null,
	 				    		 		unit:data.dosage && data.dosage.quantity ? data.dosage.quantity.units.value : null,
	 				    		 		type:"number"
	 				    		 	},
	 				    		 	{
	 				    		 		id:"frequency",
	 				    		 		label:"Dosage",
	 				    		 		value:data.dosage && data.dosage.timing ? data.dosage.timing.repeat.frequency.value : null,
	 				    		 		unit:data.dosage && data.dosage.timing ? data.dosage.timing.repeat.units.value : null,
	 				    		 		type:"select"
	 				    		 	},
	 				    		 	{
	 				    		 		id:"route",
	 				    		 		label:"Route",
	 				    		 		value:data.dosage && data.dosage.route ? data.dosage.route.coding[0].code.value : null,
	 				    		 		type:"select"
	 				    		 	},
	 				    		 	{
	 				    		 		id:"endDate",
	 				    		 		label:"End Date",
	 				    		 		value:data.dosage && data.dosage.timing && data.dosage.timing.event ? data.dosage.timing.event.end : null,
	 				    		 		type:"date"
	 				    		 	}
	 				    		 ]
	 				    };
	 				    
	 				    medicationStatements.push( m );
	 				}
	 				
	 				return medicationStatements;
	 			},
	 			
	 			parseMedicationRecords: function( data )
	 		    {
	 		        var records = new Array();
	 		        
	 		        var entries = data.entries ? data.entries : data.entry;
	 		        
	 		        for(var i=0;i<entries.length;i++)
	 		        {
	 		            var data = entries[i].content.MedicationAdministration;
	 		            
	 		            var m = new MedicationRecord();
	 		            m.id=entries[i].id.substr(entries[i].id.lastIndexOf('@')+1);
	 		            m.medicationId=data.medication.reference.value.substr(data.medication.reference.value.lastIndexOf('@')+1);
	 		            m.name=data.medication.display.value;
	 		            m.taken=data.wasNotGiven===false;
	 		            
	 		            if( m.taken )
	 		            {
	 		            	m.unit=data.dosage.quantity.units.value;
		 		            m.route=data.dosage.route.coding[0].display.value;
		 		            m.routeCode=data.dosage.route.coding[0].code.value;
		 		          	m.values=[ {values: [data.dosage.quantity.value.value], unit: data.dosage.quantity.units.value} ];
	 		            }
	 		            else
	 		            {
	 		            	m.values = [{values: ['not taken']}];
	 		            }
	 		            
	 		            m.date=data.dosage && data.dosage.timing && data.dosage.timing.event?new Date(data.dosage.timing.event.start.value):null;
	 		            
	 		           records.push( m );
	 		        }
	 		        
	 		        return records;
	 		    },
	 			
	 		    getMedicationStatement: function ( patientId, id, name, dateStringStart, dateStringEnd, asNeeded, dosageRoute, dosageQuantity, dosageUnits, dosageRepeatFrequency, dosageRepeatUnits, maxDose, enableReminders, frequency, repeatUnits )
	 			{
	 				var statement = {};
	 				
	 				var patient = new ResourceReference( new Value("Role"), new Value("patient/@" + patientId), new Code("Patient") );
	 				var period = new Period(dateStringStart?new Value( dateStringStart ):undefined, dateStringEnd?new Value( dateStringEnd ):undefined);
	 				
	 				//TODO: parse medications on ingest into generic, non-fhir objects
	 				var medication = new ResourceReference( new Value(name), new Value("medication/@" + id), new Code("Medication") );
	 				var dosage = new MedicationDosage();
	 				
	 				dosage.asNeeded = asNeeded===true;
	 				
	 				if( !dosage.asNeeded )
	 				{
	 					if( dosageQuantity && dosageUnits )
		 					dosage.quantity = new Quantity(new Value(dosageQuantity), new Value(dosageUnits.value), new Value(constants.UNITS_URL), new Code(dosageUnits.value) );
		 				
		 				if( dosageRepeatFrequency && dosageRepeatUnits )
		 					dosage.timing = new Schedule( period, {frequency:new Code(dosageRepeatFrequency),units:new Code(dosageRepeatUnits)} );
		 			    
		 				if( dosageRoute )
		 		            dosage.route = new CodeableConcept([new Coding(new Value(constants.SNOMED_URL),new Code(dosageRoute.value),new Value(dosageRoute.label))] );
		 		        
		 				if( maxDose )
		 					dosage.maxDosePerPeriod = { numerator: new Quantity(new Value(maxDose) ) };
	 				}
	 				
	 				statement.patient = patient;
	 				statement.whenGiven = period;
	 				statement.medication = medication;
	 				statement.dosage = dosage;
	 				statement.text = new Narrative( "generated", "<div xmlns=\"http://www.w3.org/1999/xhtml\">" + medication.display.value + " for patient " + patient.reference.value + "</div>" );
	 				
	 				if( enableReminders 
	 					&& frequency 
	 					&& repeatUnits )
	 				{
	 					var reminder = {repeat:{frequency:frequency,units:repeatUnits},url:""};
	 					
	 					statement.reminder = { extension: reminder };
	 				}
 				
	 				return {MedicationStatement:statement};
	 			},
	 			
	 			getMedicationAdministration: function ( patientId, medicationStatement, taken, dosageValue, dosageUnit, routeCode, routeName, dateStringStart, dateStringEnd )
	 			{
	 				var administration = {};
	 				administration.wasNotGiven = !taken;
	 				
	 				var patient = new ResourceReference( new Value("Role"), new Value("patient/@" + patientId), new Code("Patient") );
	 				var period = new Period(new Value( dateStringStart ), dateStringEnd ? new Value( dateStringEnd ) : new Value( dateStringStart ));
	 				var medication = new ResourceReference( new Value(medicationStatement.name), new Value("medication/@" + medicationStatement.id), new Code("Medication") );
	 				
	 				var dosage = new MedicationDosage();
	 				dosage.timing = new Schedule( period );
	 				
	 				if( !administration.wasNotGiven )
	 				{
		 				dosage.quantity = new Quantity(new Value(dosageValue), new Value(dosageUnit), new Value(constants.UNITS_URL), new Code(dosageUnit) );
		 				dosage.route = new CodeableConcept([new Coding(new Value(constants.SNOMED_URL),new Code(routeCode),new Value(routeName))] );
	 				}
	 				
	 				administration.dosage = dosage;
	 				administration.status = new Code("completed");
	 				administration.patient = patient;
	 				administration.whenGiven = period;
	 				administration.medication = medication;
	 				
	 				administration.text = new Narrative( "generated", "<div xmlns=\"http://www.w3.org/1999/xhtml\">" + medication.display.value + " for patient " + patient.reference.value + "</div>" );
	 				
	 				return {MedicationAdministration:administration};
	 			},
	 			
	 		    /**
	 		     * Vitals
	 		     */
	 			parseVitalStatements: function( data )
	 			{
	 				var items = new Array();
	 				
	 				var entries = data.entries ? data.entries : data.entry;
	 				
	 				for(var i=0;i<entries.length;i++)
	 				{
	 				    var data = entries[i].content.VitalStatement;
	 				    var code = data.code.coding[0].code.value;
	 				    
	 				    var m = new VitalStatement();
	 				    m.id = entries[i].id.substr(entries[i].id.lastIndexOf('@')+1);
	 				    m.type = constants.TYPE_VITAL;
	 				    m.code = code;
	 				    m.name = data.code.text.value;
	 				    m.definition = vitalsModel.definitionsIndexed[ code ];
	 				    
	 				    if( data.reminder 
	 				    	&& data.reminder.extension
	 				    	&& data.reminder.extension.repeat )
	 				    {
	 				    	m.frequency = data.reminder.extension.repeat.frequency;
	 				    	m.units = data.reminder.extension.repeat.units;
	 				    }
	 				   	
	 				    items.push( m );
	 				}
	 				
	 				return items;
	 			},
	 			
	 			//	http://www.hl7.org/implement/standards/fhir/other.html
	 			getVitalStatement: function(patientId,name,code,codeDisplay,codeURI,enableReminders,frequency,repeatUnits)
	 			{
	 				var tracker = {};
	 				
	 				var patient = new ResourceReference( new Value("Role"), new Value("patient/@" + patientId), new Code("Patient") );
	 				
	 				tracker.subject = patient;
	 				tracker.code = new CodeableConcept( [new Coding(new Value(codeURI),new Code(code),new Value(codeDisplay))],new Value(name) );
	 				tracker.author = patient;
	 				tracker.text = new Narrative( "generated", "<div xmlns=\"http://www.w3.org/1999/xhtml\">" + name + " for patient " + patient.reference.value + "</div>" );
	 				
	 				if( enableReminders 
	 					&& frequency 
	 					&& repeatUnits )
	 				{
	 					var reminder = {repeat:{frequency:frequency,units:repeatUnits},url:""};
	 					
	 					tracker.reminder = { extension: reminder };
	 				}
	 				
	 				return {VitalStatement:tracker};
	 			},
	 			
	 			parseVitalRecords: function ( data )
	 			{
	 				var vitals = new Array();
	 				var trackers = new Array();
	 				
	 				var entries = data.entries ? data.entries : data.entry;
	 				
	 				if( entries )
	 				{
	 					for(var i=0;i<entries.length;i++)
	 					{
	 						var vitalObj = entries[i].content.Observation;
	 						
	 						if( !vitalObj.appliesDateTime )
	 						{
	 							if( constants.DEBUG )
	 								console.log( "skipping entry, missing `appliesDateTime`", vitalObj );
	 							
	 							continue;
	 						}
	 						
	 						var date = Date.parse( vitalObj.appliesDateTime.value );
	 						
	 						var vital = this.parseVital(vitalObj);
	 						vital.date = date;
	 							
	 						if( vitalsModel.definitionsIndexed[vital.code] )
	 							vitals.push( vital );
	 						else if( trackersModel.definitionsIndexed[vital.code] )
	 							trackers.push( vital );
	 					}
	 				}
	 				
	 				if( constants.DEBUG ) 
	 				{
	 					console.log( 'vitals', vitals );
	 					console.log( 'trackers', trackers );
	 				}
	 				
	 				return {vitals:vitals,trackers:trackers};
	 			},
	 			
	 			parseVital: function ( data )
	 			{
	 				var code = data.name.coding[0].code.value;
	 				
	 				if( vitalsModel.definitionsIndexed[code] )
	 					definition = vitalsModel.definitionsIndexed[code];
	 				else if( trackersModel.definitionsIndexed[code] )
	 					definition = trackersModel.definitionsIndexed[code];
	 				
	 				var vital = new VitalRecord();
	 				vital.name = data.name.coding[0].display.value;
	 				vital.reportedBy = constants.REPORTER_PATIENT;
	 				vital.comments = data.comments;
	 				
	 				vital.code = code;
	 				
	 				if( definition )
	 				{
	 					vital.unit = definition.unit;
		 				vital.unitLabel = definition.unitLabel ? definition.unitLabel : definition.unit;
	 				}
	 				
	 				var values = new Array();
	 				
	 				if( data.values.length )
	 				{
	 					for(var j=0;j<data.values.length;j++)
						{
	 						var valueList = new Array();
	 						
	 						if( data.values[j].coding )
	 						{
	 							for(var c in data.values[j].coding)
	 								valueList.push( data.values[j].coding[c].display.value );
	 						}
	 						else
	 						{
	 							valueList.push( data.values[j].value.value );
	 						}
	 						
		 					values.push( {values:valueList,unit:data.values[j].units?data.values[j].units.value:null} );
						}
	 				}
	 				
	 				vital.values = values;
	 				
	 				return vital;
	 			},
	 			
	 			/**
	 			 * Tracker
	 			 */
	 			parseTrackerStatements: function( data )
	 			{
	 				var items = new Array();
	 				
	 				var entries = data.entries ? data.entries : data.entry;
	 		        
	 				for(var i=0;i<entries.length;i++)
	 				{
	 				    var data = entries[i].content.TrackerStatement;
	 				   	
	 				    var code = data.code.coding[0].code.value;
	 				    
	 				    var m = new TrackerStatement();
	 				    m.id = entries[i].id.substr(entries[i].id.lastIndexOf('@')+1);
	 				    m.code = code;
	 				    m.name = data.code.text.value;
	 				    m.type = constants.TYPE_TRACKER;
	 				    m.definition = trackersModel.definitionsIndexed[ code ];
	 				    
	 				    if( data.reminder 
	 				    	&& data.reminder.extension
	 				    	&& data.reminder.extension.repeat )
	 				    {
	 				    	m.frequency = data.reminder.extension.repeat.frequency;
	 				    	m.units = data.reminder.extension.repeat.units;
	 				    }
	 				   
	 				    items.push( m );
	 				}
	 				
	 				return items;
	 			},
	 			
	 			//	http://www.hl7.org/implement/standards/fhir/other.html
	 			getTrackerStatement: function(patientId,name,code,codeName,codeURI,enableReminders,frequency,repeatUnits)
	 			{
	 				var tracker = {};
	 				
	 				var patient = new ResourceReference( new Value("Role"), new Value("patient/@" + patientId), new Code("Patient") );
	 				
	 				tracker.subject = patient;
	 				tracker.code = new CodeableConcept( [new Coding(new Value(codeURI),new Code(code),new Value(codeName))],new Value(name) );
	 				tracker.author = patient;
	 				tracker.text = new Narrative( "generated", "<div xmlns=\"http://www.w3.org/1999/xhtml\">" + name + " for patient " + patient.reference.value + "</div>" );
	 				
	 				if( enableReminders 
	 					&& frequency 
	 					&& repeatUnits )
	 				{
	 					var reminder = {repeat:{frequency:frequency,units:repeatUnits},url:""};
	 					
	 					tracker.reminder = { extension: reminder };
	 				}
	 				
	 				return {TrackerStatement:tracker};
	 			},
	 			
	 			getTracker: function ( definition, components, comments, patientId, dateString )
	 			{
	 				var observation = {};
	 				
	 				var subject = new ResourceReference( new Value("Role"), new Value("patient/@" + patientId), new Code("Patient") );
	 				
	 				observation.subject = subject;
	 				observation.performer = subject;
	 				observation.appliesDateTime = new Value(dateString);
	 				observation.issued = new Value( new Date(dateString) );
	 				observation.interpretation = new CodeableConcept( [new Coding(new Value(constants.HL7_URL + "v2/0078"),new Code("N"),new Value("Normal (applies to non-numeric results)"))] );
	 				observation.comments = comments;
	 				
	 				var issueDateString = constants.MONTHS_ABBR[observation.issued.value.getMonth()] + " " + observation.issued.value.getDate() + " " + observation.issued.value.getFullYear();
	 				
	 				observation.values = new Array();
	 				
	 				var firstValue = null;
	 				
	 				for(var c in components)
	 				{
	 					var component = components[c];
	 					
	 					if( component.type == "number" || component.type == "range" )
	 					{
	 						observation.values.push( new Quantity( new Value(component.value), new Value(definition.unit), new Value(definition.codeURI), new Code(definition.units) ) );
	 						
	 						if( !firstValue ) firstValue = component.value;
	 					}
	 					else
	 					{
	 						var values = (typeof component.value == 'object') ?  component.value : [component.value];
	 						
	 						var codings = new Array();
	 						
	 						for(var i=0;i<values.length;i++)
	 						{
	 							if( !values[i] ) continue;
	 							
	 							var value = values[i];
		 						var valueDefinition = null;
		 						
		 						for(var v in component.values)
		 							if( component.values[v].code == value )
		 								valueDefinition = component.values[v];
		 						
		 						if( valueDefinition )
		 						{
		 							var codeURI = component.codeURI ? component.codeURI : definition.codeURI;
			 						
			 						codings.push( new Coding(new Value(codeURI),new Code(value),new Value(valueDefinition.label)) );
			 						
			 						if( !firstValue ) firstValue = value;
		 						}
	 						}
	 						
	 						if( codings.length )
	 							observation.values.push( new CodeableConcept( codings ) );
	 					}
	 				}
	 				
	 				observation.name = new CodeableConcept( [new Coding(new Value(definition.codeURI),new Code(definition.code),new Value(definition.label))] );
	 				observation.text = new Narrative( "generated", "<div xmlns=\"http://www.w3.org/1999/xhtml\">" + issueDateString + ": " + observation.subject.display.value + " " + firstValue + " (" + observation.interpretation.coding[0].display.value +")</div>" );
	 				observation.status = new Value("final");
	 				observation.reliability = new Value("ok");
	 				
	 				return {Observation:observation};
	 			},
	 			
	 			/**
	 			 * Conditions
	 			 */
	 			getCondition: function ( definition, trackers, patientId, dateString )
	 			{
	 				var condition = {};
	 				
	 				var subject = new ResourceReference( new Value("Role"), new Value("patient/@" + patientId), new Code("Patient") );
	 				
	 				condition.subject = subject;
	 				condition.asserter = subject;
	 				condition.code = new CodeableConcept( [new Coding(new Value(definition.codeURI),new Code(definition.code),new Value(definition.codeName))], new Value(definition.name) );
	 				condition.category = new CodeableConcept
	 				( 
	 					[
	 					 	new Coding(new Value(constants.HL7_URL + '/condition-category'),new Code('complaint'),new Value('Complaint')),
	 					 	new Coding(new Value(constants.SNOMED_URL),new Code('409586006'),new Value('Complaint'))
	 					 ]
	 				);
	 				
	 				condition.dateAsserted = new Value( new Date(dateString) );
	 				condition.status = "provisional";
	 				
	 				var issueDateString = constants.MONTHS_ABBR[condition.dateAsserted.value.getMonth()] + " " + condition.dateAsserted.value.getDate() + " " + condition.dateAsserted.value.getFullYear();
	 				
	 				condition.text = new Narrative( "generated", "<div xmlns=\"http://www.w3.org/1999/xhtml\">" + condition.code.coding[0].display.value + "(Date: " + issueDateString + ")</div>" );
 					
	 				var relatedItems = new Array();
	 				
	 				for(var t in trackers)
	 				{
	 					var item = 
	 					{
	 						type:new Code("following"),
	 						code:new CodeableConcept( [new Coding(new Value(trackers[t].codeURI),new Code(trackers[t].code),new Value(trackers[t].codeName))] )	
	 					};
	 					
	 					if( trackers[t].type == "medication" )
	 						item.target = new ResourceReference( new Value(trackers[t].codeName), new Value("medication/@" + trackers[t].id), new Code("Medication") );
	 					
	 					relatedItems.push( item );
	 				}
	 				
	 				condition.relatedItems = relatedItems;
	 				
	 				return {Condition:condition};
	 			},
	 			
	 			parseConditions: function( data )
	 			{
	 				var items = new Array();
	 				
	 				var entries = data.entries ? data.entries : data.entry;
	 				
	 				for(var i=0;i<entries.length;i++)
	 				{
	 				    var data = entries[i].content.Condition;
	 				    
	 				    var c = new Condition();
	 				    c.id = entries[i].id.substr(entries[i].id.lastIndexOf('@')+1);
	 				    c.code = data.code.coding[0].code.value;
	 				    c.codeName = data.code.coding[0].display.value;
	 				    c.codeURI = data.code.coding[0].system.value;
	 				    c.name = data.code.text.value;
	 				    c.trackers = new Array();
	 				    
	 				    angular.forEach
	 				    (
	 				    	data.relatedItems,function(item)
	 				    	{
	 				    		if( item.target && item.target.reference )	//	medication - use id as key
	 				    			c.trackers.push( item.target.reference.value.substr(item.target.reference.value.lastIndexOf('@')+1) );
	 				    		else if( item.code.coding.length && item.code.coding[0] )
	 				    			c.trackers.push( item.code.coding[0].code.value );
	 				    	}
	 				    );
	 				    
	 				    items.push(c);
	 				}
	 				
	 				return items;
	 			}
	 		};
	 	}
	 ]
);