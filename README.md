#Healthboard Personal Conditions Tracker (HEPCAT)#

##Description##
**Healthboard Personal Conditions Tracker (HEPCAT)** is a mobile application allowing users to track their vital signs, medications and lifestyle activities, and compare these measures against one another. The project is inspired by the [quantified self](http://quantifiedself.com/) and [patient-centered care](http://en.wikipedia.org/wiki/Patient-centered_care) trends in healthcare, and hopes to empower patients to take an active role in the management of their health.  HEPCAT was developed by the [Parsons Institute for Information Mapping](http://piim.newschool.edu/) (PIIM) and funded through the [Telemedicine & Advanced Technology Research Center](http://www.tatrc.org/) (TATRC). Its source code is in the Public Domain. [OSEHRA](http://osehra.org) is hosting the project and has adopted the Apache 2.0 License for contributions made by community members.

The application is built in HTML5 and uses [PhoneGap](http://phonegap.com) for native iOS compilation. Though iOS was targeted during the project lifecycle, compilation for Android and other platforms should be easily achievable via PhoneGap.

HEPCAT uses the [AngularJS](http://angularjs.org) and [Bootstrap](http://getbootstrap.com) front-end frameworks, [HighCharts](http://highcharts.com) and [jQuery Sparkline](http://omnipotent.net/jquery.sparkline) for charting, and [Underscore](underscorejs.org). On the back-end, HEPCAT uses a [Node.js](https://nodejs.org)/[Mongo](http://www.mongodb.org/) REST API based on [MITRE](http://mitre.org)'s [NodeOnFHIR](https://github.com/medcafe/NodeOnFHIR) project, and stores the majority of its data in HL7's emerging [FHIR](www.hl7.org/implement/standards/fhir/)-format.

##Installation Instructions##

Note that all `cd` commands assume you are *not* already in that directory, and may be skipped if so.

###1. Install Grunt###
HEPCAT uses the [Grunt](http://gruntjs.com/) Javascript task runner to generate an environment-specific config file used to expose the API endpoint. The application comes shipped with `development` and `production` environments. 

The grunt task must be run initially and when changing environments. See `Gruntfile.js` to edit the environments and their associated API endpoints. 

- **install Grunt CLI (command-line interface) and Grunt**
  - `cd [HEPCAT install directory]`
  - `npm install -g grunt-cli`
  - `npm install`

- **generate the config file** (must be run initially and when changing environments, defaults to `development`)
  - `cd [HEPCAT install directory]`
  - `grunt`
  - To generate the initial config file for production
     - `grunt --environment "production"`

###2. Install Node Server (dependency)###

- Clone the PIIM fork of MITRE's NodeOnFHIR repo
  - `git clone https://github.com/piim/NodeOnFHIR.git`
- Enable authentication
  - Open "config.js"
  - Change `exports.authenticate=false` to `exports.authenticate=true`
  - Change `exports.authorize=false` to `exports.authorize=true`
- Start the node server by following the "Running > Start the Node Server" section below (optional, can be done before #4 below)

###3. Install NDC-to-FHIR (dependency)###
HEPCAT uses the NDC drug database to drive its list of medications. Follow the following steps to download the raw data files, parse them into JSON dumps, and import them into the FHIR database.

- Clone the NDC-to-FHIR repository
  - `cd [Node-On-FHIR install directory]/fhir-server/test_data`
  - `git clone https://github.com/piim/ndc-to-fhir.git`
- Move into the test_data directory
  - `cd ndc-to-fhir`
  - `mkdir data`
  - `cd data`
- Download and unzip NDC database
  - `curl -O http://www.fda.gov/downloads/Drugs/DevelopmentApprovalProcess/UCM070838.zip`
  - `unzip UCM070838.zip -d ndc`
- Download the RxNorm database manually (NOTE: you must have a UMLS user account and be logged-in; account creation requires manual approval and takes a day or so)
  - http://download.nlm.nih.gov/umls/kss/rxnorm/RxNorm_full_08052013.zip
  - Move the zip file to `[Node-On-FHIR install directory]/fhir-server/test_data/`
  - Unzip the package manually and rename to `rx-norm` or do so via the command line:
     - `unzip RxNorm_full_08052013.zip -d rxnorm`
- Run the parse script
  - `cd [Node-On-FHIR install directory]/fhir-server/test_data/ndc-to-fhir`
  - `python parse.py`
  - ####Troubleshooting####
  	- `locale.Error: unsupported locale setting`
      - run `locale -a` to get locales supported by your system
      - edit the `locale.setlocale(locale.LC_ALL, 'en_US.utf8')` line in `parse.py` to match one of the supported locales
- Make the generated files available to the test data import script by moving them up a level
  - `mv medication organization substance ../`

###4. Import Test Data###
- Start the Node server (if not running) by following the instructions below
- `cd [Node-On-FHIR install directory]/fhir-server/test_data`
- `bash load.sh`

###5. Install Ripple###
Ripple is a Google Chrome extension for emulating PhoneGap applications in the browser. Install Ripple by visiting [this](https://chrome.google.com/webstore/detail/ripple-emulator-beta/geelfhphabnejjhdalkjhgipohgpdnoc?hl=en) link.

##Running##
###Start the Node server###
- `cd [Node-On-FHIR install directory]/fhir-server`
- `node server` 

####Troubleshooting####
- `node: command not found`
   - see http://howtonode.org/how-to-install-nodejs to install node)
- `Error: failed to connect to [localhost:27017]`
  - Start `mongod`
    - `mongod` (leave console window open)
  
##Viewing the Application##
- Pull up the application in Chrome by visiting [http://localhost/patient-tracker/www](http://localhost/patient-tracker/www)
- If this is your first time visiting the application, configure Ripple (if you see "Connecting to device" at the top of the page, Ripple is not enabled)
  - Click the icon to the right of your URL bar, then choose "Enable" from the dropdown
  - When the page reloads, choose "Apache Cordova PhoneGap" from the list of buttons
  - When the page reloads again, set the "Settings > Cross Domain Proxy" setting to disabled

##Next Steps##

##Licensing##
HEPCAT was developed by the [Parsons Institute for Information Mapping](http://piim.newschool.edu/) (PIIM) funded through the [Telemedicine & Advanced Technology Research Center](http://www.tatrc.org/) (TATRC). Its source code is in the Public Domain. [OSEHRA](http://osehra.org) is hosting the project and has adopted the Apache 2.0 License for contributions made by community members.