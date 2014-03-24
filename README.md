#Healthboard Personal Conditions Tracker (HEPCAT)#

**Healthboard Personal Conditions Tracker (HEPCAT)** is a mobile application that allows users to track their vital signs, medications and lifestyle activities, and compare these measures against one another. The project is inspired by the [quantified self](http://quantifiedself.com/) movement and [patient-centered care](http://en.wikipedia.org/wiki/Patient-centered_care), and hopes to empower patients to take an active role in the management of their health. 

HEPCAT is built in HTML5 and uses [PhoneGap](http://phonegap.com) for native iOS compilation (compilation for Android and other platforms should be easily achievable via PhoneGap). The app uses the [AngularJS](http://angularjs.org) and [Bootstrap](http://getbootstrap.com) frameworks, [HighCharts](http://highcharts.com) and [jQuery Sparkline](http://omnipotent.net/jquery.sparkline) for charting, and [Underscore](underscorejs.org). On the back-end, HEPCAT uses a [Node.js](https://nodejs.org)/[Mongo](http://www.mongodb.org/) REST API forked from [MITRE](http://mitre.org)'s [NodeOnFHIR](https://github.com/medcafe/NodeOnFHIR) project, and stores the majority of its data in HL7's [FHIR](www.hl7.org/implement/standards/fhir/)-format.

A working demo of HEPCAT can be viewed at [http://ar210.piim.newschool.edu/patient-tracker/www](http://ar210.piim.newschool.edu/patient-tracker/www). Note that you must install the [Ripple Chrome extension](https://chrome.google.com/webstore/detail/ripple-emulator-beta/geelfhphabnejjhdalkjhgipohgpdnoc?hl=en) first (detailed in **Installation > Install Ripple** below) when first launching the demo.

A schema reference detailing the underlying mongo db can be found [here](docs/schema.md).

##Installation##

**NOTE** that all `cd` commands assume you are *not* already in that directory, and may be skipped if so.

###Dependencies###

HEPCAT requires the `curl`, `grunt`, `mongo`, `mongod` `npm`, `node`, and `python` command-line utilities. If entering any of these commands in the terminal result in a `command not found` error, please install them.

###1. Server###
HEPCAT's server back-end is included in the repo as a git submodule referencing this [fork](https://github.com/piim/NodeOnFHIR/). Do the following to install and configure it.

1. Fetch server repo:

        $ cd [HEPCAT install directory]
        $ git submodule update --init --recursive
  
2. Install server dependencies:

        $ cd [HEPCAT install directory]/server
        $ npm install
  
3. Verify authentication/authorization is enabled:

        $ vi config/config.js
  - Change `exports.authenticate=false` to `exports.authenticate=true` if not already set
  - Change `exports.authorize=false` to `exports.authorize=true` if not already set

4. Start the server by following the **Running > Start the Node Server** section below

###2. Import Data###
HEPCAT uses the NDC drug database to drive its list of medications. It is included as a submodule of the Node server (a submodule itself). 

Execute the following steps to download the raw data files, parse them into JSON dumps, and import them into the FHIR database.

1. Create `data` directory:

        $ cd [HEPCAT install directory]/server/import/medications
        $ mkdir data
        $ cd data
  
2. Download and unzip NDC database:

        $ curl -O http://www.fda.gov/downloads/Drugs/DevelopmentApprovalProcess/UCM070838.zip
        $ unzip UCM070838.zip -d ndc
  
3. Run the parse script:

        $ cd [HEPCAT install directory]/server/import/medications/
        $ python parse.py
        
  - Troubleshooting
  	- `locale.Error: unsupported locale setting`
      - run `locale -a` to get locales supported by your system
      - edit the `locale.setlocale(locale.LC_ALL, 'en_US.UTF-8')` line in `parse.py` to match one of the supported locales
      
4. Start the node server (if not already running) by following the **Running > Start the Node Server** section below

5. Import FHIR data ([`medications`](http://www.hl7.org/implement/standards/fhir/medication.html), [`organizations`](http://www.hl7.org/implement/standards/fhir/organization.html) and [`substances`](http://www.hl7.org/implement/standards/fhir/substance.html))
	cd [HEPCAT install directory]/server/import
	bash load.sh
  
Verify that the data was imported correctly by executing the following GET request:

- [Show medications matching 'advil'](http://localhost:8888/medication/search?name=advil)

###3. Generate Config File###
HEPCAT uses the [Grunt](http://gruntjs.com/) Javascript task runner to generate an environment-specific config file used to expose the API endpoint. The application comes shipped with `development`, `staging` and `production` environments, and defaults to `development`.

The `Grunt` task must be run initially and when changing environments. See `Gruntfile.js` to edit the environments and their associated API endpoints. 

	$ cd [HEPCAT install directory]
	$ grunt

To generate the initial config file for production:

	$ grunt --environment "production"

###4. Install Ripple###
Ripple is a Google Chrome extension for emulating PhoneGap applications in the browser. Install Ripple by visiting [this](https://chrome.google.com/webstore/detail/ripple-emulator-beta/geelfhphabnejjhdalkjhgipohgpdnoc?hl=en) link.

Once Ripple has been installed, visit [http://localhost/patient-tracker/www](http://localhost/patient-tracker/www) (or [http://ar210.piim.newschool.edu/patient-tracker/www](http://ar210.piim.newschool.edu/patient-tracker/www) if viewing the demo) and do the following to configure the page to be viewed in Ripple:

- Click the icon to the right of your URL bar, then choose "Enable" from the dropdown
- When the page reloads, choose "Apache Cordova PhoneGap" from the list of buttons
- When the page reloads again, set the "Settings > Cross Domain Proxy" setting to disabled
- Finally, specify the desired target device under Devices

##Running##
###Start the Node server###
	$ cd [HEPCAT install directory]/server
	$ node server

####Troubleshooting####
- `node: command not found` or `npm: command not found`
   - Install NPM/Node (see [http://howtonode.org/how-to-install-nodejs to install](http://howtonode.org/how-to-install-nodejs to install node) node)
- `Error: failed to connect to [localhost:27017]`
  - Start `mongod`:
     - `mongod` (leave console window open)
     
###Viewing the Application###
- Pull up the application in Chrome by visiting [http://localhost/patient-tracker/www](http://localhost/patient-tracker/www)
- If you see "Connecting to device" at the top of the page, Ripple is probably not enabled. Please follow the steps outlined in **Installation > Install Ripple** to configure it properly.

##TODO##
- Test local notifications, debug 'Resetting plugins due to page load' error generated by Xcode
- Add unit tests (Jasmine?)
- Implement design
- Add support for all search params for various FHIR resource types (NodeOnFHIR)

##Licensing##
HEPCAT was developed by the [Parsons Institute for Information Mapping](http://piim.newschool.edu/) (PIIM) funded through the [Telemedicine & Advanced Technology Research Center](http://www.tatrc.org/) (TATRC). Its source code is in the Public Domain. [OSEHRA](http://osehra.org) is hosting the project and has adopted the Apache 2.0 License for contributions made by community members.