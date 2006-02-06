var suncult = {
  _prefLatitude: "extensions.suncult.latitude",
  _prefLatitudeNorthSouth: "extensions.suncult.latitudeNorthSouth",
  _prefLongitude: "extensions.suncult.longitude",
  _prefLongitudeEastWest: "extensions.suncult.longitudeEastWest",
  _prefTimezone: "extensions.suncult.timezone",
  _prefTimeFormat: "extensions.suncult.timeformat",
  _prefTwilightAngle: "extensions.suncult.twAngle",
  _prefSetRiseAngle: "extensions.suncult.srAngle",
  _resNoMoonrise: "suncult.noMoonrise",
  _resNoMoonset: "suncult.noMoonset",
  
  _twilightStart: null,
  _sunrise: null,
  _sunset: null,
  _twilightEnd: null,
  _moonPhaseImg: null,
  _moonImg: null,
  _moonPhase: null,
  _moonRise: null,
  _moonSet: null,
  _moonRiseAz: null,
  _moonSetAz: null,

  _latitude: null,
  _longitude: null,
  _timezone: null,
  _timeFormat: null,
  _srAngle: null,
  _twAngle: null,
  
  _prefs: null,
  _stringBundle: null,
  
  init: function() {
//    dump("in suncult.init\n");
    with (this) {
      _stringBundle = document.getElementById("string-bundle");
      _prefs = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch);
      _twilightStart = document.getElementById("suncult-twilight-start");
      _sunrise = document.getElementById("suncult-sunrise");
      _sunset = document.getElementById("suncult-sunset");
      _twilightEnd = document.getElementById("suncult-twilight-end");
      _moonPhaseImg = document.getElementById("suncult-status-icon-moon");
      _moonImg = document.getElementById("suncult-moon");
      _moonPhase = document.getElementById("suncult-moonphase");
      _moonRise = document.getElementById("suncult-moonrise");
      _moonSet = document.getElementById("suncult-moonset");
      _moonRiseAz = document.getElementById("suncult-moonrise-azimuth");
      _moonSetAz = document.getElementById("suncult-moonset-azimuth");
      readPreferences();
      if (_latitude == null || _longitude == null) {
        showConfig();
        }
      updateStatusBar();
      schedule();
      initialized = true;
    }
//    dump("leaving suncult.init\n");
  },
  
  getResource: function(r) {
    try {
      return this._stringBundle.getString(r);
    } catch (ex) {
      dump(ex + "\n");
    }
  },
  
  readPreferences: function() {
    with (this) {
      var prefs = _prefs;
      
      try {
         _latitude = prefs.getCharPref(_prefLatitude);
       }  catch(ex) {
        dump(ex + "\n");
      } finally {
        dump("latitude: " + _latitude + "\n");
      }
        
      try {
         _longitude = prefs.getCharPref(_prefLongitude);
       }  catch(ex) {
        dump(ex + "\n");
      } finally {
        dump("longitude: " + _longitude + "\n");
      }
  
      try {
         _timezone = prefs.getCharPref(_prefTimezone);
       }  catch(ex) {
        dump(ex + "\n");
      } finally {
        if (_timezone == null || _timezone == "") {
          _timezone = new Date().getTimezoneOffset();
          dump("default ");
        }
        dump("timezone: " + _timezone + "\n");
      }
  
      try {
         _timeFormat = prefs.getCharPref(_prefTimeFormat);
       }  catch(ex) {
        dump(ex + "\n");
      } finally {
        if (_timeFormat != 'h24' && _timeFormat != "ampm") {
          _timeFormat = 'h24';
          dump("default ");
        }
        dump("timeformat: " + _timeFormat + "\n");
      }
  
      try {
         _srAngle = -7.0/12.0;
         _srAngle = parseFloat(prefs.getCharPref(_prefSetRiseAngle));
       }  catch(ex) {
        dump(ex + "\n");
      } finally {
        dump("srAngle: " + _srAngle + "\n");
      }
  
  
      try {
         _twAngle = -6.0;
         _twAngle = parseFloat(prefs.getCharPref(_prefTwilightAngle));
       }  catch(ex) {
        dump(ex + "\n");
      } finally {
        dump("twAngle: " + _twAngle + "\n");
      }
    }
  },

  showConfig: function() {
    window.open("chrome://suncult/content/config.xul", "", "chrome,centerscreen");
  },
  
  onPopupShowing: function(popup) {
    with (this) {  
/*    dump("lat: " + _latitude + "\n");
      dump("long: " + _longitude + "\n");
      dump("timezone: " + _timezone + "\n");
      dump("timeformat: " + _timeFormat + "\n"); */
      var today = new Date();
      var lat = parseFloat(_latitude);
      var lon = parseFloat(_longitude);
      result = suncultCalcSun.formValues(lat, lon, today, _timezone, _timeFormat, _srAngle, _twAngle);
      if (result[0] == "all") {
        _twilightStart.value = this.getResource(_resAllTwilight)
      } else if (result[0] == "no") {
        _twilightStart.value = this.getResource(_resNoTwilight)
      } else {
        _twilightStart.value = result[0];
      }
      if (result[1] == "all") {
        _twilightStart.value = this.getResource(_resAllTwilight)
      } else if (result[1] == "no") {
        _twilightStart.value = this.getResource(_resNoTwilight)
      } else {
        _twilightEnd.value = result[1];
      }
      _sunrise.value = result[2];
      _sunset.value = result[3];
      var phase = this.getMoonPhasePercent(today);
      _moonPhase.value = Math.floor(phase) + "%";
      _moonImg.src = this.getMoonImageSrc(today, 64);
      result = suncultCalcMoon.riseset(parseFloat(_latitude),parseFloat(_longitude), today, _timezone, _timeFormat);
      if (result[0]) {
        _moonRise.value = result[0];
        _moonRiseAz.value = result[2];
      } else {
        _moonRise.value = this.getResource(_resNoMoonrise);
        _moonRiseAz.value = this.getResource(_resNoMoonrise);
      }
      if (result[1]) {
        _moonSet.value = result[1];
        _moonSetAz.value = result[3];
      } else {
        _moonSet.value = this.getResource(_resNoMoonset);
        _moonSetAz.value = this.getResource(_resNoMoonset);
      }
    } 
  },
    
  getMoonPhase: function(xdate) {
      thePhase = Math.floor(this.getMoonPhasePercent(xdate) * .279);
      return (this._latitude < 0) ? 27 - thePhase : thePhase;
  },
  
  getMoonPhasePercent: function(xdate) {
      return suncultCalcMoon.phasePercent(xdate);
  },

  getMoonImageSrc: function(xdate, size) {
    var phase = this.getMoonPhase(xdate);
    var dir = "chrome://suncult/content/images/";
    var base = "moon";
    var delim = "_";
    var ext = ".png";
    return dir + base + delim + phase + delim + size + ext;
  },

  updateStatusBar: function() {
    var imgsrc = this.getMoonImageSrc(new Date(), 20);
    this._moonPhaseImg.src = imgsrc;
  },
  
  showAlerts: function() {
  },
  
  trigger: function() {
    this.updateStatusBar();
    this.showAlerts();
    this.schedule();
  },
  
  schedule: function() {
    setTimeout("sunCultTrigger();", 60000);
  }
};

function sunCultTrigger() {
  suncult.trigger();
}

window.addEventListener("load", function(e) { suncult.init(e); }, false); 

// vim: ts=2
