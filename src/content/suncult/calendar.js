"use strict";
const suncultPrefix = "extensions.suncult.";

var suncult = {
  _prefLatitude: suncultPrefix + "latitude",
  _prefLongitude: suncultPrefix + "longitude",
  _prefTimezone: suncultPrefix + "timezone",
  _prefTimeFormat: suncultPrefix + "timeformat",
  _prefTwilightAngle: suncultPrefix + "twAngle",
  _prefSetRiseAngle: suncultPrefix + "srAngle",

  _prefShowSun: suncultPrefix + "show.sun",
  _prefShowSunImage: suncultPrefix + "show.sun.image",
  _prefShowSunTwilightStart: suncultPrefix + "show.sun.twilight-start",
  _prefShowSunTwilightEnd: suncultPrefix + "show.sun.twilight-end",
  _prefShowSunrise: suncultPrefix + "show.sun.sunrise",
  _prefShowSunset: suncultPrefix + "show.sun.sunset",
  _prefShowSunriseAzimuth: suncultPrefix + "show.sun.sunrise.azimuth",
  _prefShowSunsetAzimuth: suncultPrefix + "show.sun.sunset.azimuth",
  _prefShowMidday: suncultPrefix + "show.sun.midday",

  _prefShowMoon: suncultPrefix + "show.moon",
  _prefShowMoonImage: suncultPrefix + "show.moon.image",
  _prefShowMoonrise: suncultPrefix + "show.moon.moonrise",
  _prefShowMoonriseAzimuth: suncultPrefix + "show.moon.moonrise.azimuth",
  _prefShowMoonset: suncultPrefix + "show.moon.moonset",
  _prefShowMoonsetAzimuth: suncultPrefix + "show.moon.moonset.azimuth",
  _prefShowMoonphase: suncultPrefix + "show.moon.phase",
  _prefShowNextFullMoon: suncultPrefix + "show.moon.next-full",
  _prefShowNextNewMoon: suncultPrefix + "show.moon.next-new",
  _prefShowMoonDate: suncultPrefix + "show.moon.time-as-date",

  _resNoMoonrise: "suncult.noMoonrise",
  _resNoMoonset: "suncult.noMoonset",
  _resMoonPrefix: "suncult.moon.",
  _resAllTwilight: "suncult.sun.twilight.all",
  _resNoTwilight: "suncult.sun.twilight.no",
  
  _twilightStart: null,
  _sunrise: null,
  _midday: null,
  _sunset: null,
  _sunriseAzimuth: null,
  _sunsetAzimuth: null,
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
      this._stringBundle = document.getElementById("suncult-string-bundle");
      this._prefs = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch);
      this._twilightStart = document.getElementById("suncult-twilight-start");
      this._sunrise = document.getElementById("suncult-sunrise");
      this._sunset = document.getElementById("suncult-sunset");
      this._sunriseAzimuth = document.getElementById("suncult-sunrise-azimuth");
      this._sunsetAzimuth = document.getElementById("suncult-sunset-azimuth");
      this._midday = document.getElementById("suncult-midday");
      this._twilightEnd = document.getElementById("suncult-twilight-end");
      this._moonPhaseImg = document.getElementById("suncult-status-icon-moon");
      this._moonImg = document.getElementById("suncult-moon-img");
      this._moonPhase = document.getElementById("suncult-moonphase");
      this._nextFullMoon = document.getElementById("suncult-next-fullmoon");
      this._nextNewMoon = document.getElementById("suncult-next-newmoon");
      this._moonRise = document.getElementById("suncult-moonrise");
      this._moonSet = document.getElementById("suncult-moonset");
      this._moonRiseAz = document.getElementById("suncult-moonrise-azimuth");
      this._moonSetAz = document.getElementById("suncult-moonset-azimuth");
      
      this._calendar_date = document.getElementById("suncult-calendar-date");
      
      this.readPreferences();
      
      Components.classes["@mozilla.org/observer-service;1"]
            .getService(Components.interfaces.nsIObserverService)
            .addObserver(this, "SunCult:Configuration", false);      
      this.update();
                  
      //initialized = true;
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
      this._latitude = this.getCharPref(this._prefLatitude, null);
      this._longitude = this.getCharPref(this._prefLongitude, null);
      this._timezone = this.getCharPref(this._prefTimezone, new Date().getTimezoneOffset());
      this._timeFormat = this.getCharPref(this._prefTimeFormat, 'h24');
      this._srAngle = parseFloat(this.getCharPref(this._prefSetRiseAngle, -7.0/12.0));
      this._twAngle = parseFloat(this.getCharPref(this._prefTwilightAngle, -6.0));

      this._showSun = this.getBoolPref(this._prefShowSun, true);
      this._showSunImage = this.getBoolPref(this._prefShowSunImage, true);
      this._showSunTwilightStart = this.getBoolPref(this._prefShowSunTwilightStart, true);
      this._showSunTwilightEnd = this.getBoolPref(this._prefShowSunTwilightEnd, true);
      this._showSunrise = this.getBoolPref(this._prefShowSunrise, true);
      this._showSunset = this.getBoolPref(this._prefShowSunset, true);
      this._showSunriseAzimuth = this.getBoolPref(this._prefShowSunriseAzimuth, false);
      this._showSunsetAzimuth = this.getBoolPref(this._prefShowSunsetAzimuth, false);
      this._showMidday = this.getBoolPref(this._prefShowMidday, false);

      this._showMoon = this.getBoolPref(this._prefShowMoon, true);
      this._showMoonImage = this.getBoolPref(this._prefShowMoonImage, true);
      this._showMoonrise = this.getBoolPref(this._prefShowMoonrise, true);
      this._showMoonriseAzimuth = this.getBoolPref(this._prefShowMoonriseAzimuth, false);
      this._showMoonset = this.getBoolPref(this._prefShowMoonset, true);
      this._showMoonsetAzimuth = this.getBoolPref(this._prefShowMoonsetAzimuth, false);
      this._showMoonphase = this.getBoolPref(this._prefShowMoonphase, true);
      this._showNextFullMoon = this.getBoolPref(this._prefShowNextFullMoon, true);
      this._showNextNewMoon = this.getBoolPref(this._prefShowNextNewMoon, false);
      this._showMoonDate = this.getBoolPref(this._prefShowMoonDate, true);

      this._showHide();
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

  _showHide: function() {
      document.getElementById("suncult-sun").collapsed = !this._showSun;
      document.getElementById("suncult-sun-img-box").collapsed = !this._showSunImage;
      document.getElementById("suncult-row-twilightStart").collapsed = !this._showSunTwilightStart;
      document.getElementById("suncult-row-sunrise").collapsed = !this._showSunrise;
      document.getElementById("suncult-row-midday").collapsed = !this._showMidday;
      document.getElementById("suncult-row-sunset").collapsed = !this._showSunset;
      document.getElementById("suncult-row-sunrise-azimuth").collapsed = !this._showSunriseAzimuth;
      document.getElementById("suncult-row-sunset-azimuth").collapsed = !this._showSunsetAzimuth;
      document.getElementById("suncult-row-twilightEnd").collapsed = !this._showSunTwilightEnd;

      document.getElementById("suncult-moon").collapsed = !this._showMoon;
      document.getElementById("suncult-moon-img-box").collapsed = !this._showMoonImage;
      document.getElementById("suncult-row-moonrise").collapsed = !this._showMoonrise;
      document.getElementById("suncult-row-moonrise-azimuth").collapsed = !this._showMoonriseAzimuth;
      document.getElementById("suncult-row-moonset").collapsed = !this._showMoonset;
      document.getElementById("suncult-row-moonset-azimuth").collapsed = !this._showMoonsetAzimuth;
      document.getElementById("suncult-row-moonphase").collapsed = !this._showMoonphase;
      document.getElementById("suncult-row-nextFullMoon").collapsed = !this._showNextFullMoon;
      document.getElementById("suncult-row-nextNewMoon").collapsed = !this._showNextNewMoon;

      document.getElementById("suncult-separator").collapsed = this._showMoon ^ this._showSun;
  },

  updateSun: function(popup) {
/*    dump("lat: " + this._latitude + "\n");
      dump("long: " + this._longitude + "\n");
      dump("timezone: " + this._timezone + "\n");
      dump("timeformat: " + this._timeFormat + "\n"); */
      var day = this._calendar_date.dateValue;
      var lat = parseFloat(this._latitude);
      var lon = parseFloat(this._longitude);
      var result = suncultCalcSun.formValues(lat, lon, day, this._timezone, this._timeFormat, this._srAngle, this._twAngle);
      if (result[0] == "all") {
          this._twilightStart.value = this.getResource(this._resAllTwilight);
      } else if (result[0] == "no") {
          this._twilightStart.value = this.getResource(this._resNoTwilight);
      } else {
          this._twilightStart.value = result[0];
      }
      if (result[1] == "all") {
          this._twilightEnd.value = this.getResource(this._resAllTwilight);
      } else if (result[1] == "no") {
          this._twilightEnd.value = this.getResource(this._resNoTwilight);
      } else {
          this._twilightEnd.value = result[1];
      }
      this._sunrise.value = result[2];
      this._sunset.value = result[3];
      this._midday.value = result[4];
      this._sunriseAzimuth.value = result[5];
      this._sunsetAzimuth.value = result[6];
  },
  
  updateMoon: function(popup) {
      var day = this._calendar_date.dateValue;
      var lat = parseFloat(this._latitude);
      var lon = parseFloat(this._longitude);
      this._moonPhase.value = this.getResource(this._resMoonPrefix + suncultCalcMoon.phaseName(day));
      var dfm = suncultCalcMoon.daysToFullMoon(day);
      var d = Math.floor(dfm);
      var h = Math.floor((dfm - d) * 24);

      var str = null;

      var myDate1 = new Date();
      if (this._showMoonDate) {
        myDate1.setTime(day.valueOf());
        myDate1.setDate(myDate1.getDate() + d);
        myDate1.setHours(myDate1.getHours() + h);
        str = myDate1.toLocaleDateString() + " " + myDate1.toLocaleTimeString();
        // Don't need to the second precision for date display, so hack off last three characters
        this._nextFullMoon.value = str.substr (0, str.length - 3);
      } else {	
        this._nextFullMoon.value = d + "d " + h + "h";
      }

      var dnm = suncultCalcMoon.daysToNewMoon(day);
      d = Math.floor(dnm);
      h = Math.floor((dnm - d) * 24);

      var myDate2 = new Date();
      if (this._showMoonDate) {
        myDate2.setTime(day.valueOf());
        myDate2.setDate(myDate2.getDate() + d);
        myDate2.setHours(myDate2.getHours() + h);
        str = myDate2.toLocaleDateString() + " " + myDate2.toLocaleTimeString();
        // Don't need to the second precision for date display, so hack off last three characters
        this._nextNewMoon.value = str.substr (0, str.length - 3);
      } else {
        this._nextNewMoon.value = d + "d " + h + "h";
      }

      this._moonImg.src = this.getMoonImageSrc(day, 64);

      var result = suncultCalcMoon.riseset(parseFloat(this._latitude),parseFloat(this._longitude), day, this._timezone, this._timeFormat);
      if (result[0]) {
          this._moonRise.value = result[0];
          this._moonRiseAz.value = result[2];
      } else {
          this._moonRise.value = this.getResource(this._resNoMoonrise);
          this._moonRiseAz.value = this.getResource(this._resNoMoonrise);
      }
      if (result[1]) {
          this._moonSet.value = result[1];
          this._moonSetAz.value = result[3];
      } else {
          this._moonSet.value = this.getResource(this._resNoMoonset);
          this._moonSetAz.value = this.getResource(this._resNoMoonset);
      }
  },
    
  getMoonPhase: function(xdate) {
      var thePhase = Math.floor(this.getMoonPhasePercent(xdate) * .279);
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
