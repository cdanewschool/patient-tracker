app.factory
(
	'fhir-factory',
	[
	 	'vitalsModel','trackersModel','constants',
	 	function(vitalsModel,trackersModel,constants)
	 	{
	 		var LOINC_CODE_BLOOD_PRESSURE = "55284-4";
	 		var LOINC_CODE_BLOOD_PRESSURE_DIASTOLIC = "8462-4";
	 		var LOINC_CODE_BLOOD_PRESSURE_SYSTOLIC = "8480-6";
	 		var LOINC_CODE_BODY_HEIGHT = "3137-7";
	 		var LOINC_CODE_HEART_RATE = "8867-4";
	 		var LOINC_CODE_RESPIRATORY_RATE = "9279-1";
	 		var LOINC_CODE_BODY_TEMPERATURE = "8310-5";
	 		var LOINC_CODE_WEIGHT ="3141-9";
	 		
	 		return {
	 			
	 			parseMedicationStatements: function( data )
	 			{
	 			    var medicationStatements = [];
	 				
	 				var entries = data.entries ? data.entries : data.entry;
	 		        
	 				for(var i=0;i<entries.length;i++)
	 				{	
	 				    var data = entries[i].content.MedicationStatement;
	 				    
	 				    var m = new MedicationStatement();
	 				    m.id=entries[i].id.substr(entries[i].id.lastIndexOf('@')+1);
	 				    m.name=data.medication.display.value;
	 				    m.definition = 
	 				    {
	 				    	label:data.medication.display.value,
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
	 			
	 			parseMedicationAdministrations: function( data )
	 		    {
	 		        var medicationAdministrations = [];
	 		        
	 		        var entries = data.entries ? data.entries : data.entry;
	 		        
	 		        for(var i=0;i<entries.length;i++)
	 		        {
	 		            var data = entries[i].content.MedicationAdministration;
	 		            
	 		            var m = new MedicationAdministration();
	 		            m.id=entries[i].id.substr(entries[i].id.lastIndexOf('@')+1);
	 		            m.medicationId=data.medication.reference.value.substr(data.medication.reference.value.lastIndexOf('@')+1);
	 		            m.name=data.medication.display.value;
	 		            m.dosageValue=data.dosage.quantity.value.value;
	 		            m.dosageUnits=data.dosage.quantity.units.value;
	 		            m.routeCode=data.dosage.route.coding[0].code.value;
	 		            m.routeValue=data.dosage.route.coding[0].display.value;
	 		            m.startDate=data.dosage.timing.event?new Date(data.dosage.timing.event.start.value):null;
	 		            
	 		            medicationAdministrations.push( m );
	 		        }
	 		        
	 		        return medicationAdministrations;
	 		    },
	 			
	 		    getMedicationStatement: function ( patientId, medicationObj, dateStringStart, dateStringEnd, dosageRoute, dosageQuantity, dosageUnits, dosageRepeatFrequency, dosageRepeatUnits )
	 			{
	 				var statement = new MedicationStatement();
	 				
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
	 				var administration = new MedicationAdministration();
	 				
	 				var patient = new ResourceReference( new Value("Role"), new Value("patient/@" + patientId), new Code("Patient") );
	 				var period = new Period(new Value( dateStringStart ), dateStringEnd ? new Value( dateStringEnd ) : null);
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
	 				    
	 				    var m = new VitalStatement();
	 				    m.id=entries[i].id.substr(entries[i].id.lastIndexOf('@')+1);
	 				    m.name = data.code.text.value;
	 				    m.definition = vitalsModel.definitionsIndexed[ data.code.coding[0].code.value ];
	 				    
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
	 			
	 			parseVitals: function ( data, patient )
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
	 						
	 						if( vitalObj.component )
	 						{
	 							for(var j=0;j<vitalObj.component.length;j++)
	 							{
	 								var vital = this.parseVital(vitalObj.component[j]);
	 								vital.date = date;
	 								
	 								if( vital.type )
	 									vitals.push( vital );
	 								else	//TODO: only add if tracker type validated
	 									trackers.push( vital );
	 							}
	 						}
	 						else
	 						{
	 							var vital = this.parseVital(vitalObj);
	 							vital.date = date;
	 							
	 							if( vital.type )
	 								vitals.push( vital );
	 							else	//TODO: only add if tracker type validated
	 								trackers.push( vital );
	 						}
	 					}
	 				}
	 				
	 				if( constants.DEBUG ) 
	 				{
	 					console.log( 'vitals', vitals );
	 					console.log( 'trackers', trackers );
	 				}
	 				
	 				return {vitals:vitals,tracker:trackers};
	 			},
	 			
	 			parseVital: function ( data )
	 			{
	 				var vital = new Vital();
	 				vital.name = data.name.coding[0].display.value;
	 				vital.reportedBy = constants.REPORTER_PATIENT;
	 				
	 				if( data.valueQuantity )
	 				{
	 					vital.unit = data.valueQuantity.units.value;
	 					vital.value = data.valueQuantity.value.value;
	 				}
	 				
	 				var code = data.name.coding[0].code.value;
	 				
	 				if( code == LOINC_CODE_BLOOD_PRESSURE_DIASTOLIC )
	 					vital.type = constants.VITAL_TYPE_BLOOD_PRESSURE_DIASTOLIC;
	 				else if( code == LOINC_CODE_BODY_HEIGHT )		//	body height measured
	 					vital.type = constants.VITAL_TYPE_HEIGHT;
	 				else if( code == LOINC_CODE_HEART_RATE )
	 					vital.type = constants.VITAL_TYPE_HEART_RATE;
	 				else if( code == LOINC_CODE_RESPIRATORY_RATE )
	 					vital.type = constants.VITAL_TYPE_RESPIRATORY_RATE;
	 				else if( code == LOINC_CODE_BLOOD_PRESSURE_SYSTOLIC )
	 					vital.type = constants.VITAL_TYPE_BLOOD_PRESSURE_SYSTOLIC;
	 				else if( code == LOINC_CODE_BODY_TEMPERATURE )
	 					vital.type = constants.VITAL_TYPE_BODY_TEMPERATURE;
	 				else if( code == LOINC_CODE_WEIGHT )		//	body weight measured
	 					vital.type = constants.VITAL_TYPE_WEIGHT;
	 				
	 				return vital;
	 			},
	 			
	 			getVital: function ( id, value, value2, units, patientId, dateString )
	 			{
	 				var observation = {};
	 				
	 				var subject = new ResourceReference( new Value("Role"), new Value("patient/@" + patientId), new Code("Patient") );
	 				
	 				observation.subject = subject;
	 				observation.performer = subject;
	 				observation.appliesDateTime = new Value( dateString );
	 				observation.issued = new Value( new Date(dateString) );
	 				observation.interpretation = new CodeableConcept( [new Coding(new Value(constants.HL7_URL + "v2/0078"),new Code("N"),new Value("Normal (applies to non-numeric results)"))] );
	 				
	 				var issueDateString = constants.MONTHS_ABBR[observation.issued.value.getMonth()] + " " + observation.issued.value.getDate() + " " + observation.issued.value.getFullYear();
	 				
	 				if( id == constants.VITAL_TYPE_BLOOD_PRESSURE )
	 				{
	 					var systolic = new ObservationComponentComponent();
	 					systolic.name = new CodeableConcept( [new Coding(new Value(constants.LOINC_URL),new Code(LOINC_CODE_BLOOD_PRESSURE_SYSTOLIC),new Value("Systolic blood pressure"))] );
	 					systolic.valueQuantity = new Quantity( new Value(value), new Value(units) );
	 					
	 					var diastolic = new ObservationComponentComponent();
	 					diastolic.name = new CodeableConcept( [new Coding(new Value(constants.LOINC_URL),new Code(LOINC_CODE_BLOOD_PRESSURE_DIASTOLIC),new Value("Diastolic blood pressure"))] );
	 					diastolic.valueQuantity = new Quantity( new Value(value2), new Value(units) );
	 					
	 					observation.name = new CodeableConcept( [new Coding(new Value(constants.LOINC_URL),new Code(LOINC_CODE_BLOOD_PRESSURE),new Value("Blood pressure systolic and diastolic"))] );
	 					observation.component = [ systolic, diastolic ];
	 					observation.text = new Narrative( "generated", "<div xmlns=\"http://www.w3.org/1999/xhtml\">" + issueDateString + ": " + observation.subject.display.value + " " + systolic.valueQuantity.value.value + "/" + diastolic.valueQuantity.value.value + " (" + observation.interpretation.coding[0].display.value +")</div>" );
	 				}
	 				else if( id == constants.VITAL_TYPE_HEART_RATE )
	 				{
	 					var heartRate = new ObservationComponentComponent();
	 					heartRate.name = new CodeableConcept( [new Coding(new Value(constants.LOINC_URL),new Code(LOINC_CODE_HEART_RATE),new Value("Heart rate"))] );
	 					heartRate.valueQuantity = new Quantity( new Value(value), new Value(units) );
	 					
	 					observation.name = new CodeableConcept( [new Coding(new Value(constants.LOINC_URL),new Code(LOINC_CODE_HEART_RATE),new Value("Heart rate"))] );
	 					observation.component = [ heartRate ];
	 					observation.text = new Narrative( "generated", "<div xmlns=\"http://www.w3.org/1999/xhtml\">" + issueDateString + ": " + observation.subject.display.value + " " + heartRate.valueQuantity.value.value + " (" + observation.interpretation.coding[0].display.value +")</div>" );
	 				}
	 				else if( id == constants.VITAL_TYPE_RESPIRATORY_RATE )
	 				{
	 					var respiratoryRate = new ObservationComponentComponent();
	 					respiratoryRate.name = new CodeableConcept( [new Coding(new Value(constants.LOINC_URL),new Code(LOINC_CODE_RESPIRATORY_RATE),new Value("Respiratory rate"))] );
	 					respiratoryRate.valueQuantity = new Quantity( new Value(value), new Value(units) );
	 					
	 					observation.name = new CodeableConcept( [new Coding(new Value(constants.LOINC_URL),new Code(LOINC_CODE_RESPIRATORY_RATE),new Value("Respiratory rate"))] );
	 					observation.component = [ respiratoryRate ];
	 					observation.text = new Narrative( "generated", "<div xmlns=\"http://www.w3.org/1999/xhtml\">" + issueDateString + ": " + observation.subject.display.value + " " + respiratoryRate.valueQuantity.value.value + " (" + observation.interpretation.coding[0].display.value +")</div>" );
	 				}
	 				else if( id == constants.VITAL_TYPE_BODY_TEMPERATURE )
	 				{
	 					var temperature = new ObservationComponentComponent();
	 					temperature.name = new CodeableConcept( [new Coding(new Value(constants.LOINC_URL),new Code(LOINC_CODE_BODY_TEMPERATURE),new Value("Body temperature"))] );
	 					temperature.valueQuantity = new Quantity( new Value(value), new Value(units) );
	 					
	 					observation.name = new CodeableConcept( [new Coding(new Value(constants.LOINC_URL),new Code(LOINC_CODE_BODY_TEMPERATURE),new Value("Body temperature"))] );
	 					observation.component = [ temperature ];
	 					observation.text = new Narrative( "generated", "<div xmlns=\"http://www.w3.org/1999/xhtml\">" + issueDateString + ": " + observation.subject.display.value + " " + temperature.valueQuantity.value.value + " (" + observation.interpretation.coding[0].display.value +")</div>" );
	 				}
	 				else if( id == constants.VITAL_TYPE_WEIGHT )
	 				{
	 					var weight = new ObservationComponentComponent();
	 					weight.name = new CodeableConcept( [new Coding(new Value(constants.LOINC_URL),new Code(LOINC_CODE_WEIGHT),new Value("Weight"))] );
	 					weight.valueQuantity = new Quantity( new Value(value), new Value(units) );
	 					
	 					observation.name = new CodeableConcept( [new Coding(new Value(constants.LOINC_URL),new Code(LOINC_CODE_WEIGHT),new Value("Weight"))] );
	 					observation.component = [ weight ];
	 					observation.text = new Narrative( "generated", "<div xmlns=\"http://www.w3.org/1999/xhtml\">" + issueDateString + ": " + observation.subject.display.value + " " + weight.valueQuantity.value.value + " (" + observation.interpretation.coding[0].display.value +")</div>" );
	 				}
	 				
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
	 				    
	 				    var m = new TrackerStatement();
	 				    m.id=entries[i].id.substr(entries[i].id.lastIndexOf('@')+1);
	 				    m.name = data.code.text.value;
	 				    m.definition = trackersModel.definitionsIndexed[ data.code.coding[0].code.value ];
	 				    
	 				    items.push( m );
	 				}
	 				
	 				return items;
	 			},
	 			
	 			//	http://www.hl7.org/implement/standards/fhir/other.html
	 			getTrackerStatement: function(patientId,name,code,codeDisplay,codeSystem)
	 			{
	 				var tracker = {};
	 				
	 				var patient = new ResourceReference( new Value("Role"), new Value("patient/@" + patientId), new Code("Patient") );
	 				
	 				tracker.subject = patient;
	 				tracker.code = new CodeableConcept( [new Coding(new Value(codeSystem),new Code(code),new Value(codeDisplay))],new Value(name) );
	 				tracker.author = patient;
	 				tracker.text = new Narrative( "generated", "<div xmlns=\"http://www.w3.org/1999/xhtml\">" + name + " for patient " + patient.reference.value + "</div>" );
	 				
	 				return {TrackerStatement:tracker};
	 			},
	 			
	 			getTracker: function ( name, value, units, patientId, dateString, code, codeSystem )
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
	 				component.name = new CodeableConcept( [new Coding(new Value(codeSystem),new Code(code),new Value(name))] );
	 				component.valueQuantity = new Quantity( new Value(value), new Value(units), new Value(constants.UNITS_URL), new Code(units) );
	 				
	 				observation.name = new CodeableConcept( [new Coding(new Value(codeSystem),new Code(code),new Value(name))] );
	 				observation.component = [ component ];
	 				observation.text = new Narrative( "generated", "<div xmlns=\"http://www.w3.org/1999/xhtml\">" + issueDateString + ": " + observation.subject.display.value + " " + component.valueQuantity.value.value + " (" + observation.interpretation.coding[0].display.value +")</div>" );
	 				observation.status = new Value("final");
	 				observation.reliability = new Value("ok");
	 				
	 				return {Observation:observation};
	 			},
	 			
	 			/*
	 			getUser: function(username,password,name)
	 			{
	 			    var user = {};
	 			    user.text = new Narrative( "generated" );
	 			    user.login = new Value(username);
	 			    user.name = new Value(name);
	 		        user.password = new Value(password);
	 		        user.level = new Value("patient");
	 		        
	 			    return {User:user};
	 			}
	 			*/
	 		};
	 	}
	 ]
);