var suncult = {
	_prefLatitude: "suncult.latitude",
	_prefLatitudeNorthSouth: "suncult.latitudeNorthSouth",
	_prefLongitude: "suncult.longitude",
	_prefLongitudeEastWest: "suncult.longitudeEastWest",
	
	_twilightStart: null,
	_sunrise: null,
	_sunset: null,
	_twilightEnd: null,
	_latitude: null,
	_longitude: null,
	
  init: function() {
		this._twilightStart = document.getElementById("suncult-twilight-start");
		this._sunrise = document.getElementById("suncult-sunrise");
		this._sunset = document.getElementById("suncult-sunset");
		this._twilightEnd = document.getElementById("suncult-twilight-end");
		this.readPreferences();
		if (this._latitude == null || this._longitude == null) {
			this.showConfig();
			}
    this.initialized = true;
  },

	readPreferences: function() {
	  var prefs = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch);
	
	  if (prefs.getPrefType(this._prefLatitude) == prefs.PREF_INT){
	    this._latitude = prefs.getIntPref(this._prefLatitude);
	  }
		
	  if (prefs.getPrefType(this._prefLatitudeNorthSouth) == prefs.PREF_STRING){
	    var northSouth = prefs.getCharPref(this._prefLatitudeNorthSouth);
	    if ("south" == northSouth) {
	    	this._latitude = -this._latitude;
	    	}
	  }

	  if (prefs.getPrefType(this._prefLongitude) == prefs.PREF_INT){
	    this._longitude = prefs.getIntPref(this._prefLongitude);
	  }

	  if (prefs.getPrefType(this._prefLongitudeEastWest) == prefs.PREF_STRING){
	    var eastWest = prefs.getCharPref(this._prefLongitudeEastWest);
	    if ("west" == eastWest) {
	    	this._longitude = -this._longitude;
	    	}
	  }

	},
	
  showConfig: function() {
    window.open("chrome://suncult/content/config.xul", "", "chrome,centerscreen,modal");
  },
  
  onPopupShowing: function(popup) {
  	this.readPreferences();
  	result = suncultCalc.formValues(this._latitude,this._longitude,new Date());
		this._twilightStart.value = result[0];
		this._twilightEnd.value = result[1];
		this._sunrise.value = result[2];
		this._sunset.value = result[3];
  	}
};

window.addEventListener("load", function(e) { suncult.init(e); }, false); 
