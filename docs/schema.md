##Schema Reference##

###Mongo Collections###

The application has three main subsystems: **medications**, **vitals**, and **custom trackers**. 

Each sub-system has three mongo collections: 

1. one for the master list of available selectable options within the category
2. one for storing the fact that a user selected the tracker
3. one for storing data for that tracker

These collections are hierarchical, in that (3) refers to a record in (2), and (2) refers to a record in (1). Note that vitals and trackers store their data in the same `observations` table, and the data is differentiated between the two by a `type` property.

<table>
	<thead>
		<td><strong>Collection Name</strong></td>
		<td><strong>Contents</strong></td>
		<td><strong>FHIR?</strong></td>
	</thead
    <tr>
        <td>conditiondefinitions</td>
        <td>list of available conditions; each condition definition references definitions (vitals, custom trackers) and medications</td>
        <td>No</td>
    </tr>
    <tr>
        <td>conditions</td>
        <td>conditions selected by users</td>
        <td>No</td>
    </tr>
    <tr>
        <td>definitions</td>
        <td>list of available vitals and trackers</td>
        <td>No</td>
    </tr>
	<tr>
        <td><a href="http://www.hl7.org/implement/standards/fhir/medicationadministration.html">medicationadministrations</a></td>
        <td>list of available medications user is able</td>
        <td>Yes</td>
    </tr>				
	<tr>
        <td><a href="http://www.hl7.org/implement/standards/fhir/medication.html">medications</a></td>
        <td>list of available medications user is able</td>
         <td>Yes</td>
    </tr>
    <tr>
        <td><a href="http://www.hl7.org/implement/standards/fhir/medicationstatement.html">medicationstatements</a></td>
        <td>medications selected by users (ties a medication to a user)</td>
         <td>Yes</td>
    </tr>
	<tr>
        <td><a href="http://www.hl7.org/implement/standards/fhir/observation.html">observations</a></td>
        <td>records of a vital/custom tracker measurements (ties vitalstatements/trackerstatements with a datetime and value)</td>
        <td>Yes</td>
    </tr>
	<tr>
        <td><a href="http://www.hl7.org/implement/standards/fhir/organization.html">organizations</a></td>
        <td></td>
        <td>Yes</td>
    </tr>
    <tr>
        <td>sessions</td>
        <td>token for an authenticated user</td>
        <td>No</td>
    </tr>
	<tr>
        <td><a href="http://www.hl7.org/implement/standards/fhir/substance.html">substances</a></td>
        <td>active ingredients in medications</td>
        <td>Yes</td>
    </tr>
    <tr>
        <td><a href="http://www.hl7.org/implement/standards/fhir/other.html">trackerstatements</a></td>
        <td>custom trackers selected by a user</td>
        <td>Yes (Other)</td>
    </tr>
    <tr>
        <td>users</td>
        <td>user accounts</td>
        <td>No</td>
    </tr>
    <tr>
        <td><a href="http://www.hl7.org/implement/standards/fhir/other.html">vitalstatements</a></td>
        <td>vitals selected by a user</td>
        <td>Yes (Other)</td>
    </tr>
</table>

###Clearing Data###

Before attempting to clear anything, enter the `mongo` shell and select the `patient-tracker` database:

	$ mongo
	$ use patient-tracker

Find your user's id (assuming you registered with 'test@test.com') execute the following command. The _id property in the returned JSON is your user's id:
          
	$ db.users.find( {"username":"test@test.com"}, {"_id":true} )
		
Clear the session for your user (i.e. if you want to show the login page and not be forwarded to /home after a refresh):

	$ db.sessions.remove( {"_id":ObjectId("youruserid")} )
		
Wipe all selections for your user:

	$ db.vitalstatements.remove( {"entry.content.VitalStatement.subject.reference.value":"patient/@[youridhere]"} )
	$ db.trackerstatements.remove( {"entry.content.TrackerStatement.subject.reference.value":"patient/@[youridhere]"} )
	$ db.medicationstatements.remove( {"entry.content.MedicationStatement.patient.reference.value":"patient/@[youridhere]"} )
	$ db.conditions.remove( {"entry.content.Condition.subject.reference.value":"patient/@[youridhere]"} )
		
Wipe data entered by your user (if you don't do this, previously entered data for a tracker will re-appear after re-adding it)

	$ db.observations.remove( {"entry.content.Observation.subject.reference.value":"patient/@[youridhere]"} )
	$ db.medicationadministrations.remove( {"entry.content.Condition.subject.reference.value":"patient/@[youridhere]"} )