#Healthboard Personal Conditions Tracker (HEPCAT)#

##Description##
**Healthboard Personal Conditions Tracker (HEPCAT)** is a mobile application that allows users to track their vital signs, medications and lifestyle activities, and compare these measures against one another. The project is inspired by the [quantified self](http://quantifiedself.com/) and [patient-centered care](http://en.wikipedia.org/wiki/Patient-centered_care) trends in healthcare, and hopes to empower patients to take an active role in the management of their health. 


##Technologies##

HEPCAT is built in HTML5 and uses [PhoneGap](http://phonegap.com) for native iOS compilation. Though iOS was targeted, compilation for Android and other platforms should be easily achievable via PhoneGap. The app uses the [AngularJS](http://angularjs.org) and [Bootstrap](http://getbootstrap.com) front-end frameworks, [HighCharts](http://highcharts.com) and [jQuery Sparkline](http://omnipotent.net/jquery.sparkline) for charting, and a little [Underscore](underscorejs.org). On the back-end, HEPCAT uses a [Node.js](https://nodejs.org)/[Mongo](http://www.mongodb.org/) REST API based on [MITRE](http://mitre.org)'s [NodeOnFHIR](https://github.com/medcafe/NodeOnFHIR) project, and stores the majority of its data in HL7's emerging [FHIR](www.hl7.org/implement/standards/fhir/)-format.

##DEMO##

HEPCAT can be previewed [here](http://ar210.piim.newschool.edu/patient-tracker/www). Note that you must first install the [Ripple Chrome extension](https://chrome.google.com/webstore/detail/ripple-emulator-beta/geelfhphabnejjhdalkjhgipohgpdnoc?hl=en) (detailed below) and follow the steps detailed in *Viewing the Application* when first launching the demo.

##Installation Instructions##

Note that all `cd` commands assume you are *not* already in that directory, and may be skipped if so.

###1. Install Grunt###
HEPCAT uses the [Grunt](http://gruntjs.com/) Javascript task runner to generate an environment-specific config file used to expose the API endpoint. The application comes shipped with `development`, `staging` and `production` environments. 

The `Grunt` task must be run initially and when changing environments. See `Gruntfile.js` to edit the environments and their associated API endpoints. 

- **Install Grunt CLI (command-line interface) and Grunt**
  - `cd [HEPCAT install directory]`
  - `npm install -g grunt-cli`
  - `npm install`

- **Generate the config file** (must be run initially and when changing environments, defaults to `development`)
  - `cd [HEPCAT install directory]`
  - `grunt`
  - To generate the initial config file for production
     - `grunt --environment "production"`

###2. Install Node Server###
- Initialize the server submodule
  - `cd [HEPCAT install directory]`
  - `git submodule init`
  - `git submodule update`
- Install server's Node module dependencies
  - `cd [HEPCAT install directory]/server`
  - `npm install`
- Enable authentication
  - Open `config.js`
    - Change `exports.authenticate=false` to `exports.authenticate=true`
    - Change `exports.authorize=false` to `exports.authorize=true`
- Start the server by following the "Running > Start the Node Server" section below

###3. Import Medication Data###
HEPCAT uses the NDC drug database to drive its list of medications. It is included as a submodule of the Node server (a submodule itself). Follow the following steps to download the raw data files, parse them into JSON dumps, and import them into the FHIR database.

NOTE: Due to its size, the database could not be included with the repo and must be downloaded manually.

- Init the submodule
  - `cd [HEPCAT install directory]/server`
  - `git submodule init`
  - `git submodule update`
- Create a `data` directory
  - `cd [HEPCAT install directory]/server/medications`
  - `mkdir data`
  - `cd data`
- Download and unzip NDC database
  - `curl -O http://www.fda.gov/downloads/Drugs/DevelopmentApprovalProcess/UCM070838.zip`
  - `unzip UCM070838.zip -d ndc`
- Run the parse script
  - `cd [HEPCAT install directory]/server/medications/`
  - `python parse.py`
  - Troubleshooting
  	- `locale.Error: unsupported locale setting`
      - run `locale -a` to get locales supported by your system
      - edit the `locale.setlocale(locale.LC_ALL, 'en_US.UTF-8')` line in `parse.py` to match one of the supported locales
- Start the node server by following the "Running > Start the Node Server" section below
- Import FHIR data ([`medications`](http://www.hl7.org/implement/standards/fhir/medication.html), [`organizations`](http://www.hl7.org/implement/standards/fhir/organization.html) and [`substances`](http://www.hl7.org/implement/standards/fhir/substance.html))
  - `cd [HEPCAT install directory]/server/medications`
  - `bash load.sh`
  
###4. Install Ripple###
Ripple is a Google Chrome extension for emulating PhoneGap applications in the browser. Install Ripple by visiting [this](https://chrome.google.com/webstore/detail/ripple-emulator-beta/geelfhphabnejjhdalkjhgipohgpdnoc?hl=en) link.

##Running##
###Start the Node server###
- `cd [HEPCAT install directory]/server`
- `node server`
###Viewing the Application###
- Pull up the application in Chrome by visiting [http://localhost/patient-tracker/www](http://localhost/patient-tracker/www)
- If this is your first time visiting the application, configure Ripple (if you see "Connecting to device" at the top of the page, Ripple is not enabled)
  - Click the icon to the right of your URL bar, then choose "Enable" from the dropdown
  - When the page reloads, choose "Apache Cordova PhoneGap" from the list of buttons
  - When the page reloads again, set the "Settings > Cross Domain Proxy" setting to disabled
  
####Troubleshooting####
- `node: command not found` or `npm: command not found`
   - Install NPM/Node (see [http://howtonode.org/how-to-install-nodejs to install](http://howtonode.org/how-to-install-nodejs to install node) node)
- `Error: failed to connect to [localhost:27017]`
  - Start `mongod`:
     - `mongod` (leave console window open)

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
        <td>medicationadministrations</td>
        <td>list of available medications user is able</td>
        <td>Yes</td>
    </tr>				
	<tr>
        <td>medications</td>
        <td>list of available medications user is able</td>
         <td>Yes</td>
    </tr>
    <tr>
        <td>medicationstatements</td>
        <td>medications selected by users (ties a medication to a user)</td>
         <td>Yes</td>
    </tr>
	<tr>
        <td>observations</td>
        <td>records of a vital/custom tracker measurements (ties vitalstatements/trackerstatements with a datetime and value)</td>
        <td>Yes</td>
    </tr>
	<tr>
        <td>organizations</td>
        <td></td>
        <td>Yes</td>
    </tr>
	<tr>
        <td>patients</td>
        <td></td>
        <td>Yes</td>
    </tr>
	<tr>
        <td>practitioners</td>
        <td></td>
        <td>Yes</td>
    </tr>
    <tr>
        <td>sessions</td>
        <td>token for an authenticated user</td>
        <td>No</td>
    </tr>
	<tr>
        <td>substances</td>
        <td>token for an authenticated user</td>
        <td>Yes</td>
    </tr>
    <tr>
        <td>trackerstatements</td>
        <td>custom trackers selected by a user</td>
        <td>Yes</td>
    </tr>
    <tr>
        <td>users</td>
        <td>user accounts</td>
        <td>No</td>
    </tr>
    <tr>
        <td>vitalstatements</td>
        <td>vitals selected by a user</td>
        <td>Yes</td>
    </tr>
</table>

###Clearing Data###

- To find your user's id (assuming you registered with 'test@test.com') execute the following command. The _id property in the returned JSON is your user's id:
  - `db.users.find( {"username":"test@test.com"}, {"_id":true} )`
- To clear the session for your user (i.e. if you want to show the login page and not be forwarded to /home after a refresh):
  - `db.sessions.remove( {"_id":ObjectId("youruserid")} )`
- To wipe all selections for your user:
  - `db.vitalstatements.remove( {"entry.content.VitalStatement.subject.reference.value":"patient/@[youridhere]"} )`
  - `db.trackerstatements.remove( {"entry.content.TrackerStatement.subject.reference.value":"patient/@[youridhere]"} )`
  - `db.medicationstatements.remove( {"entry.content.MedicationStatement.patient.reference.value":"patient/@[youridhere]"} )`
  - `db.conditions.remove( {"entry.content.Condition.subject.reference.value":"patient/@[youridhere]"} )`
- To wipe data entered by your user (if you don't do this, previously entered data for a tracker will re-appear after re-adding it)
  - `db.observations.remove( {"entry.content.Observation.subject.reference.value":"patient/@[youridhere]"} )`
  - `db.medicationadministrations.remove( {"entry.content.Condition.subject.reference.value":"patient/@[youridhere]"} )`

##Next Steps##

##Licensing##
HEPCAT was developed by the [Parsons Institute for Information Mapping](http://piim.newschool.edu/) (PIIM) funded through the [Telemedicine & Advanced Technology Research Center](http://www.tatrc.org/) (TATRC). Its source code is in the Public Domain. [OSEHRA](http://osehra.org) is hosting the project and has adopted the Apache 2.0 License for contributions made by community members.