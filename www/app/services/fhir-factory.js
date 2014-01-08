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
	 			    var medicationStatements = [];
	 				
	 				var entries = data.entries ? data.entries : data.entry;
	 		        
	 				for(var i=0;i<entries.length;i++)
	 				{	
	 				    var data = entries[i].content.MedicationStatement;
	 				    
	 				    var name = _.str.titleize(data.medication.display.value);
	 				    
	 				    var m = new MedicationStatement();
	 				    m.id=entries[i].id.substr(entries[i].id.lastIndexOf('@')+1);
	 				   	m.code=entries[i].id.substr(entries[i].id.lastIndexOf('@')+1);
	 				    m.name=name;
	 				    m.type=constants.TYPE_MEDICATION;
	 				    m.definition=
	 				    {
	 				    	label:name,
	 				    	components:
	 				    		[
	 				    		 	{
	 				    		 		id:"dosage",
	 				    		 		label:"Dosage",
	 				    		 		value:data.dosage.quantity.value.value,
	 				    		 		unit:data.dosage.quantity.units.value,
	 				    		 		type:"number"
	 				    		 	},
	 				    		 	{
	 				    		 		id:"frequency",
	 				    		 		label:"Dosage",
	 				    		 		value:data.dosage.timing.repeat.frequency.value,
	 				    		 		unit:data.dosage.timing.repeat.units.value,
	 				    		 		type:"select"
	 				    		 	},
	 				    		 	{
	 				    		 		id:"route",
	 				    		 		label:"Route",
	 				    		 		value:data.dosage.route.coding[0].code.value,
	 				    		 		type:"select"
	 				    		 	},
	 				    		 	{
	 				    		 		id:"endDate",
	 				    		 		label:"End Date",
	 				    		 		value:data.dosage.timing.event?data.dosage.timing.event.end:null,
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
	 		        var records = [];
	 		        
	 		        var entries = data.entries ? data.entries : data.entry;
	 		        
	 		        for(var i=0;i<entries.length;i++)
	 		        {
	 		            var data = entries[i].content.MedicationAdministration;
	 		            
	 		            var m = new MedicationRecord();
	 		            m.id=entries[i].id.substr(entries[i].id.lastIndexOf('@')+1);
	 		            m.medicationId=data.medication.reference.value.substr(data.medication.reference.value.lastIndexOf('@')+1);
	 		            m.name=data.medication.display.value;
	 		            m.value=data.dosage.quantity.value.value;
	 		            m.unit=data.dosage.quantity.units.value;
	 		            m.route=data.dosage.route.coding[0].display.value;
	 		            m.routeCode=data.dosage.route.coding[0].code.value;
	 		            m.date=data.dosage.timing.event?new Date(data.dosage.timing.event.start.value):null;
	 		            
	 		           records.push( m );
	 		        }
	 		        
	 		        return records;
	 		    },
	 			
	 		    getMedicationStatement: function ( patientId, medicationObj, dateStringStart, dateStringEnd, dosageRoute, dosageQuantity, dosageUnits, dosageRepeatFrequency, dosageRepeatUnits )
	 			{
	 				var statement = {};
	 				
	 				var patient = new ResourceReference( new Value("Role"), new Value("patient/@" + patientId), new Code("Patient") );
	 				var period = new Period(dateStringStart?new Value( dateStringStart ):undefined, dateStringEnd?new Value( dateStringEnd ):null);
	 				
	 				//TODO: parse medications on ingest into generic, non-fhir objects
	 				var medication = new ResourceReference( new Value(medicationObj.content.Medication.name.value), new Value("medication/@" + medicationObj.id), new Code("Medication") );
	 				
	 				var dosage = new MedicationDosage();
	 				dosage.quantity = new Quantity(new Value(dosageQuantity), new Value(dosageUnits.value), new Value(constants.UNITS_URL), new Code(dosageUnits.value) );
	 				dosage.timing = new Schedule( period, {frequency:new Code(dosageRepeatFrequency),units:new Code(dosageRepeatUnits)} );
	 			    
	 				if( dosageRoute )
	 		            dosage.route = new CodeableConcept([new Coding(new Value(constants.SNOMED_URL),new Code(dosageRoute.value),new Value(dosageRoute.label))] );
	 		        
	 				statement.patient = patient;
	 				statement.whenGiven = period;
	 				statement.medication = medication;
	 				statement.dosage = dosage;
	 				statement.text = new Narrative( "generated", "<div xmlns=\"http://www.w3.org/1999/xhtml\">" + medication.display.value + " for patient " + patient.reference.value + "</div>" );
	 				
	 				return {MedicationStatement:statement};
	 			},
	 			
	 			getMedicationAdministration: function ( patientId, practitionerId, medicationStatement, dosageValue, dosageUnit, routeCode, routeName, dateStringStart, dateStringEnd )
	 			{
	 				var administration = {};
	 				
	 				var patient = new ResourceReference( new Value("Role"), new Value("patient/@" + patientId), new Code("Patient") );
	 				var period = new Period(new Value( dateStringStart ), dateStringEnd ? new Value( dateStringEnd ) : dateStringStart);
	 				var medication = new ResourceReference( new Value(medicationStatement.name), new Value("medication/@" + medicationStatement.id), new Code("Medication") );
	 				
	 				var dosage = new MedicationDosage();
	 				dosage.quantity = new Quantity(new Value(dosageValue), new Value(dosageUnit), new Value(constants.UNITS_URL), new Code(dosageUnit) );
	 				dosage.route = new CodeableConcept([new Coding(new Value(constants.SNOMED_URL),new Code(routeCode),new Value(routeName))] );
	 				dosage.timing = new Schedule( period );
	 				
	 				administration.status = new Code("completed");
	 				administration.patient = patient;
	 				administration.whenGiven = period;
	 				administration.medication = medication;
	 				administration.dosage = dosage;
	 				administration.text = new Narrative( "generated", "<div xmlns=\"http://www.w3.org/1999/xhtml\">" + medication.display.value + " for patient " + patient.reference.value + "</div>" );
	 				
	 				//TODO: figure out if practitioner=patient if self-administered
	 				if( practitionerId != null )
	 				{
	 				    patient.practioner = new ResourceReference( new Value("Role"), new Value("practitioner/@" + practitionerId), new Code("Practioner") );
	 				}
	 				
	 				return {MedicationAdministration:administration};
	 			},
	 			
	 		    /**
	 		     * Vitals
	 		     */
	 			parseVitalStatements: function( data )
	 			{
	 				var items = [];
	 				
	 				var entries = data.entries ? data.entries : data.entry;
	 				
	 				for(var i=0;i<entries.length;i++)
	 				{
	 				    var data = entries[i].content.VitalStatement;
	 				    var code = data.code.coding[0].code.value;
	 				    var m = new VitalStatement();
	 				    m.id=entries[i].id.substr(entries[i].id.lastIndexOf('@')+1);
	 				    m.type=constants.TYPE_VITAL;
	 				    m.code = code;
	 				    m.name = data.code.text.value;
	 				    m.definition = vitalsModel.definitionsIndexed[ code ];
	 				    
	 				    items.push( m );
	 				}
	 				
	 				return items;
	 			},
	 			
	 			//	http://www.hl7.org/implement/standards/fhir/other.html
	 			getVitalStatement: function(patientId,name,code,codeDisplay,codeSystem)
	 			{
	 				var tracker = {};
	 				
	 				var patient = new ResourceReference( new Value("Role"), new Value("patient/@" + patientId), new Code("Patient") );
	 				
	 				tracker.subject = patient;
	 				tracker.code = new CodeableConcept( [new Coding(new Value(codeSystem),new Code(code),new Value(codeDisplay))],new Value(name) );
	 				tracker.author = patient;
	 				tracker.text = new Narrative( "generated", "<div xmlns=\"http://www.w3.org/1999/xhtml\">" + name + " for patient " + patient.reference.value + "</div>" );
	 				
	 				return {VitalStatement:tracker};
	 			},
	 			
	 			parseVitalRecords: function ( data )
	 			{
	 				var vitals = [];
	 				var trackers = [];
	 				
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
	 				
	 				vital.code = code;
	 				
	 				if( definition )
	 				{
	 					vital.unit = definition.unit;
		 				vital.unitLabel = definition.unitLabel ? definition.unitLabel : definition.unit;
	 				}
	 				
	 				var values = [];
	 				
	 				if( data.component.length )
	 				{
	 					for(var j=0;j<data.component.length;j++)
						{
		 					values.push( data.component[j].valueQuantity.value.value );
						}
	 					
	 					vital.unit = data.component[0].valueQuantity.units.value;
	 				}
	 				
	 				vital.values = values;
	 				vital.valueLabel = vital.values.join("/"); 	//TODO: make separator dynamic
	 				
	 				return vital;
	 			},
	 			
	 			getVital: function ( definition, values, patientId, dateString )
	 			{
	 				var observation = {};
	 				
	 				var subject = new ResourceReference( new Value("Role"), new Value("patient/@" + patientId), new Code("Patient") );
	 				
	 				observation.subject = subject;
	 				observation.performer = subject;
	 				observation.appliesDateTime = new Value( dateString );
	 				observation.issued = new Value( new Date(dateString) );
	 				observation.interpretation = new CodeableConcept( [new Coding(new Value(constants.HL7_URL + "v2/0078"),new Code("N"),new Value("Normal (applies to non-numeric results)"))] );
	 				
	 				var issueDateString = constants.MONTHS_ABBR[observation.issued.value.getMonth()] + " " + observation.issued.value.getDate() + " " + observation.issued.value.getFullYear();
	 				var components = [];
	 				
	 				for(var i=0;i<definition.components.length;i++)
	 				{
	 					var code = definition.components[i].code ? definition.components[i].code : definition.code;
	 					var codeURI = definition.components[i].codeURI ? definition.components[i].codeURI : definition.codeURI;
	 					var codeName = definition.components[i].codeName ? definition.components[i].codeName : definition.codeName;
	 					
	 					var component = new ObservationComponentComponent();
	 					component.name = new CodeableConcept( [new Coding(new Value(codeURI),new Code(code),new Value(codeName))] );
	 					component.valueQuantity = new Quantity( new Value(values[i]), new Value(definition.unit) );
	 					
	 					components.push( component );
	 				}
	 				
	 				observation.name = new CodeableConcept( [new Coding(new Value(definition.codeURI),new Code(definition.code),new Value(definition.codeName))] );
 					observation.component = components;
 					observation.text = new Narrative( "generated", "<div xmlns=\"http://www.w3.org/1999/xhtml\">" + issueDateString + ": " + observation.subject.display.value + " " + values.join("/") + " (" + observation.interpretation.coding[0].display.value +")</div>" );
 					
	 				if( observation.name )	//	given id matches a supported observation type
	 				{
	 					observation.status = new Value("final");
	 					observation.reliability = new Value("ok");
	 					
	 					return {Observation:observation};
	 				}
	 				
	 				return null;
	 			},
	 			
	 			/**
	 			 * Tracker
	 			 */
	 			parseTrackerStatements: function( data )
	 			{
	 				var items = [];
	 				
	 				var entries = data.entries ? data.entries : data.entry;
	 		        
	 				for(var i=0;i<entries.length;i++)
	 				{
	 				    var data = entries[i].content.TrackerStatement;
	 				    var code = data.code.coding[0].code.value;
	 				    
	 				    var m = new TrackerStatement();
	 				    m.id=entries[i].id.substr(entries[i].id.lastIndexOf('@')+1);
	 				    m.code = code;
	 				    m.name=data.code.text.value;
	 				    m.type=constants.TYPE_TRACKER;
	 				    m.definition=trackersModel.definitionsIndexed[ code ];
	 				    
	 				    items.push( m );
	 				}
	 				
	 				return items;
	 			},
	 			
	 			//	http://www.hl7.org/implement/standards/fhir/other.html
	 			getTrackerStatement: function(patientId,name,code,codeName,codeURI)
	 			{
	 				var tracker = {};
	 				
	 				var patient = new ResourceReference( new Value("Role"), new Value("patient/@" + patientId), new Code("Patient") );
	 				
	 				tracker.subject = patient;
	 				tracker.code = new CodeableConcept( [new Coding(new Value(codeURI),new Code(code),new Value(codeName))],new Value(name) );
	 				tracker.author = patient;
	 				tracker.text = new Narrative( "generated", "<div xmlns=\"http://www.w3.org/1999/xhtml\">" + name + " for patient " + patient.reference.value + "</div>" );
	 				
	 				return {TrackerStatement:tracker};
	 			},
	 			
	 			getTracker: function ( definition, value, patientId, dateString )
	 			{
	 				var observation = {};
	 				
	 				var subject = new ResourceReference( new Value("Role"), new Value("patient/@" + patientId), new Code("Patient") );
	 				
	 				observation.subject = subject;
	 				observation.performer = subject;
	 				observation.appliesDateTime = new Value(dateString);
	 				observation.issued = new Value( new Date(dateString) );
	 				observation.interpretation = new CodeableConcept( [new Coding(new Value(constants.HL7_URL + "v2/0078"),new Code("N"),new Value("Normal (applies to non-numeric results)"))] );
	 				
	 				var issueDateString = constants.MONTHS_ABBR[observation.issued.value.getMonth()] + " " + observation.issued.value.getDate() + " " + observation.issued.value.getFullYear();
	 				
	 				var component = new ObservationComponentComponent();
	 				component.name = new CodeableConcept( [new Coding(new Value(definition.codeURI),new Code(definition.code),new Value(definition.codeName))] );
	 				component.valueQuantity = new Quantity( new Value(value), new Value(definition.unit), new Value(constants.UNITS_URL), new Code(definition.units) );
	 				
	 				observation.name = new CodeableConcept( [new Coding(new Value(definition.codeURI),new Code(definition.code),new Value(definition.label))] );
	 				observation.component = [ component ];
	 				observation.text = new Narrative( "generated", "<div xmlns=\"http://www.w3.org/1999/xhtml\">" + issueDateString + ": " + observation.subject.display.value + " " + component.valueQuantity.value.value + " (" + observation.interpretation.coding[0].display.value +")</div>" );
	 				observation.status = new Value("final");
	 				observation.reliability = new Value("ok");
	 				
	 				return {Observation:observation};
	 			}
	 			
	 		};
	 	}
	 ]
);