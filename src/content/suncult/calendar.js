const suncultPrefix = "extensions.suncult.";

var suncult = {
  _prefLatitude: suncultPrefix + "latitude",
  _prefLongitude: suncultPrefix + "longitude",
  _prefTimezone: suncultPrefix + "timezone",
  _prefTimeFormat: suncultPrefix + "timeformat",
  _prefTwilightAngle: suncultPrefix + "twAngle",
  _prefSetRiseAngle: suncultPrefix + "srAngle",

  _resNoMoonrise: "suncult.noMoonrise",
  _resNoMoonset: "suncult.noMoonset",
  _resMoonPrefix: "suncult.moon.",
  
  _twilightStart: null,
  _sunrise: null,
  _midday: null,
  _sunset: null,
  _twilightEnd: null,
  _moonPhaseImg: null,
  _moonImg: null,
  _moonPhase: null,
  _nextFullMoon: null,
  _nextNewMoon: null,
  _moonRise: null,
  _moonSet: null,
  _moonRiseAz: null,
  _moonSetAz: null,
  
  _calendar_date: null,

  _latitude: null,
  _longitude: null,
  _timezone: null,
  _timeFormat: null,
  _srAngle: -7.0/12.0,
  _twAngle: -6.0,

  _prefs: null,
  _stringBundle: null,
  
  init: function() {
//    dump("in suncult.init\n");
    with (this) {
      _stringBundle = document.getElementById("suncult-string-bundle");
      _prefs = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch);
      _twilightStart = document.getElementById("suncult-twilight-start");
      _sunrise = document.getElementById("suncult-sunrise");
      _sunset = document.getElementById("suncult-sunset");
      _sunriseAzimuth = document.getElementById("suncult-sunrise-azimuth");
      _sunsetAzimuth = document.getElementById("suncult-sunset-azimuth");
      _midday = document.getElementById("suncult-midday");
      _twilightEnd = document.getElementById("suncult-twilight-end");
      _moonPhaseImg = document.getElementById("suncult-status-icon-moon");
      _moonImg = document.getElementById("suncult-moon-img");
      _moonPhase = document.getElementById("suncult-moonphase");
      _nextFullMoon = document.getElementById("suncult-next-fullmoon");
      _nextNewMoon = document.getElementById("suncult-next-newmoon");
      _moonRise = document.getElementById("suncult-moonrise");
      _moonSet = document.getElementById("suncult-moonset");
      _moonRiseAz = document.getElementById("suncult-moonrise-azimuth");
      _moonSetAz = document.getElementById("suncult-moonset-azimuth");
      
      _calendar_date = document.getElementById("suncult-calendar-date");
      
      readPreferences();
      
      Components.classes["@mozilla.org/observer-service;1"]
            .getService(Components.interfaces.nsIObserverService)
            .addObserver(this, "SunCult:Configuration", false);      
      update();
                  
      initialized = true;
    }
//    dump("leaving suncult.init\n");
  },
  
  getResource: function(r) {
    try {
      return this._stringBundle.getString(r);
    } catch (ex) {
      dump(ex + "\n");
      return null;
    }
  },

  observe: function(subject, topic, data) {
    if (topic == "SunCult:Configuration") {
      this.readPreferences();
    } else {
      throw new Error("Unexpected topic received: {" + topic + "}");
    }
  },

  
  readPreferences: function() {
    with (this) {
      _latitude = getCharPref(_prefLatitude, null);
      _longitude = getCharPref(_prefLongitude, null);
      _timezone = getCharPref(_prefTimezone, new Date().getTimezoneOffset());
      _timeFormat = getCharPref(_prefTimeFormat, 'h24');
      _srAngle = parseFloat(getCharPref(_prefSetRiseAngle, -7.0/12.0));
      _twAngle = parseFloat(getCharPref(_prefTwilightAngle, -6.0));
    }
  },
  
  getBoolPref: function(name, defval) {
    var result = defval;
    try {
       result = this._prefs.getBoolPref(name);
     } catch(ex) {
//      dump(ex + "\n");
    } finally {
//      dump(name + ": " + result + "\n");
    }
    return result;
  },

  getCharPref: function(name, defval) {
    var result = defval;
    try {
       result = this._prefs.getCharPref(name);
     } catch(ex) {
//      dump(ex + "\n");
    } finally {
      if (!result) result = defval;
//      dump(name + ": " + result + "\n");
    }
    return result;
  },

  getIntPref: function(name, defval) {
    var result = defval;
    try {
       result = this._prefs.getIntPref(name);
     } catch(ex) {
//      dump(ex + "\n");
    } finally {
//      dump(name + ": " + result + "\n");
    }
    return result;
  },

  updateSun: function(popup) {
    with (this) {
/*    dump("lat: " + _latitude + "\n");
      dump("long: " + _longitude + "\n");
      dump("timezone: " + _timezone + "\n");
      dump("timeformat: " + _timeFormat + "\n"); */
      var day = _calendar_date.dateValue;
      var lat = parseFloat(_latitude);
      var lon = parseFloat(_longitude);
      var result = suncultCalcSun.formValues(lat, lon, day, _timezone, _timeFormat, _srAngle, _twAngle);
      if (result[0] == "all") {
        _twilightStart.value = getResource(_resAllTwilight)
      } else if (result[0] == "no") {
        _twilightStart.value = getResource(_resNoTwilight)
      } else {
        _twilightStart.value = result[0];
      }
      if (result[1] == "all") {
        _twilightStart.value = getResource(_resAllTwilight)
      } else if (result[1] == "no") {
        _twilightStart.value = getResource(_resNoTwilight)
      } else {
        _twilightEnd.value = result[1];
      }
      _sunrise.value = result[2];
      _sunset.value = result[3];
      _midday.value = result[4];
      _sunriseAzimuth.value = result[5];
      _sunsetAzimuth.value = result[6];
    }
  },
  
  updateMoon: function(popup) {
    with (this) {
      var day = _calendar_date.dateValue;
      var lat = parseFloat(_latitude);
      var lon = parseFloat(_longitude);
      _moonPhase.value = getResource(_resMoonPrefix + suncultCalcMoon.phaseName(day));
      var dfm = suncultCalcMoon.daysToFullMoon(day);
      var d = Math.floor(dfm);
      var h = Math.floor((dfm - d) * 24)
      _nextFullMoon.value = d + "d " + h + "h";
      var dnm = suncultCalcMoon.daysToNewMoon(day);
      d = Math.floor(dnm);
      h = Math.floor((dnm - d) * 24)
      _nextNewMoon.value = d + "d " + h + "h";
      _moonImg.src = getMoonImageSrc(day, 64);

      var result = suncultCalcMoon.riseset(parseFloat(_latitude),parseFloat(_longitude), day, _timezone, _timeFormat);
      if (result[0]) {
        _moonRise.value = result[0];
        _moonRiseAz.value = result[2];
      } else {
        _moonRise.value = getResource(_resNoMoonrise);
        _moonRiseAz.value = getResource(_resNoMoonrise);
      }
      if (result[1]) {
        _moonSet.value = result[1];
        _moonSetAz.value = result[3];
      } else {
        _moonSet.value = getResource(_resNoMoonset);
        _moonSetAz.value = getResource(_resNoMoonset);
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

  update: function() {
  	this.updateSun(null);
  	this.updateMoon(null);
	},

};

window.addEventListener("load", function(e) { suncult.init(e); }, false); 
