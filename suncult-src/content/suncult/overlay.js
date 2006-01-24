var suncult = {
	_prefLatitude: "suncult.latitude",
	_prefLatitudeNorthSouth: "suncult.latitudeNorthSouth",
	_prefLongitude: "suncult.longitude",
	_prefLongitudeEastWest: "suncult.longitudeEastWest",
	_prefTimezone: "suncult.timezone",
	_prefTimeFormat: "suncult.timeformat",
	
	_twilightStart: null,
	_sunrise: null,
	_sunset: null,
	_twilightEnd: null,

	_latitude: null,
	_longitude: null,
  _timezone: null,
  _timeFormat: null,
	
  init: function() {
		dump("in suncult.init\n");
		this._twilightStart = document.getElementById("suncult-twilight-start");
		this._sunrise = document.getElementById("suncult-sunrise");
		this._sunset = document.getElementById("suncult-sunset");
		this._twilightEnd = document.getElementById("suncult-twilight-end");
		this.migratePreferences();
		this.readPreferences();
		if (this._latitude == null || this._longitude == null) {
			this.showConfig();
			}
    this.initialized = true;
		dump("leaving suncult.init\n");
  },

	migratePreferences: function() {
	  var prefs = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch);
	  
	  // 0.2 - 0.3
		var latitude = null;
		var longitude = null;

    try {
  	  if (prefs.getPrefType(this._prefLatitude) == prefs.PREF_INT){
  	    latitude = prefs.getIntPref(this._prefLatitude);
  	  }
  		
  	  if (prefs.getPrefType(this._prefLatitudeNorthSouth) == prefs.PREF_STRING){
  	    var northSouth = prefs.getCharPref(this._prefLatitudeNorthSouth);
  	    if ("south" == northSouth) {
  	    	latitude = -latitude;
  	    	}
  			prefs.clearUserPref(this._prefLatitudeNorthSouth);
  	  }
   	}	catch(ex) {
      dump(ex + "\n");
    }

    try {
  	  if (prefs.getPrefType(this._prefLongitude) == prefs.PREF_INT){
  	    longitude = prefs.getIntPref(this._prefLongitude);
  	  }
  
  	  if (prefs.getPrefType(this._prefLongitudeEastWest) == prefs.PREF_STRING){
  	    var eastWest = prefs.getCharPref(this._prefLongitudeEastWest);
  	    if ("west" == eastWest) {
  	    	longitude = -longitude;
  	    	}
  			prefs.clearUserPref(this._prefLongitudeEastWest);
  	  }
   	}	catch(ex) {
      dump(ex + "\n");
    }

		if (latitude) {
			prefs.setIntPref(this._prefLatitude, latitude);
			}
		if (longitude) {
			prefs.setIntPref(this._prefLongitude, longitude);
			}
			
	},
	
	readPreferences: function() {
    var prefs = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch);
  	
    try {
 	    this._latitude = prefs.getIntPref(this._prefLatitude);
   	}	catch(ex) {
      dump(ex + "\n");
    } finally {
      dump("latitude: " + this._latitude + "\n");
    }
  		
    try {
 	    this._longitude = prefs.getIntPref(this._prefLongitude);
   	}	catch(ex) {
      dump(ex + "\n");
    } finally {
      dump("longitude: " + this._longitude + "\n");
    }

    try {
 	    this._timezone = prefs.getCharPref(this._prefTimezone);
   	}	catch(ex) {
      dump(ex + "\n");
    } finally {
  	  if (this._timezone == null || this._timezone == "") {
  	    this._timezone = new Date().getTimezoneOffset();
  	    dump("default ");
  	  }
  	  dump("timezone: " + this._timezone + "\n");
    }

    try {
 	    this._timeFormat = prefs.getCharPref(this._prefTimeFormat);
   	}	catch(ex) {
      dump(ex + "\n");
    } finally {
  	  if (this._timeFormat != 'h24' && this._timeFormat != "ampm") {
  	    this._timeFormat = 'h24';
  	    dump("default ");
  	  }
  	  dump("timeformat: " + this._timeFormat + "\n");
    }
	},

  showConfig: function() {
    window.open("chrome://suncult/content/config.xul", "", "chrome,centerscreen,modal");
  	this.readPreferences();
  },
  
  onPopupShowing: function(popup) {
  	result = suncultCalc.formValues(this._latitude,this._longitude,new Date(), this._timezone, this._timeFormat);
		this._twilightStart.value = result[0];
		this._twilightEnd.value = result[1];
		this._sunrise.value = result[2];
		this._sunset.value = result[3];
  	}
};

window.addEventListener("load", function(e) { suncult.init(e); }, false); 
