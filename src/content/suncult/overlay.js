"use strict";

const suncultPrefix = "extensions.suncult.";

var suncult = {
  _prefLatitude: suncultPrefix + "latitude",
  _prefLongitude: suncultPrefix + "longitude",
  _prefTimezone: suncultPrefix + "timezone",
  _prefTimeFormat: suncultPrefix + "timeformat",
  _prefTwilightAngle: suncultPrefix + "twAngle",
  _prefSetRiseAngle: suncultPrefix + "srAngle",
  _prefBar: suncultPrefix + "bar",
  _prefBarPosition: suncultPrefix + "bar.position",
  _prefMenuConfig: suncultPrefix + "config.menu",

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

  _today: null,

  _twilightStart: null,
  _sunrise: null,
  _midday: null,
  _sunset: null,
  _sunriseAzimuth : null,
  _sunsetAzimuth : null,
  _twilightEnd: null,
  _sunImg: null,
  _sunShadeImg: null,

  _moonPhaseImg: null,
  _moonImg: null,
  _moonPhase: null,
  _nextFullMoon: null,
  _nextNewMoon: null,
  _moonRise: null,
  _moonSet: null,
  _moonRiseAz: null,
  _moonSetAz: null,

  _latitude: null,
  _longitude: null,
  _timezone: null,
  _timeFormat: null,
  _srAngle: -7.0/12.0,
  _twAngle: -6.0,
  _toolbar: "status-bar",
  _toolbarPosition: "-1",

  _showSun: true,
  _showSunImage: true,
  _showSunTwilightStart: true,
  _showSunTwilightEnd: true,
  _showSunrise: true,
  _showSunset: true,
  _showSunriseAzimuth: false,
  _showSunsetAzimuth: false,
  _showMidday: false,

  _showMoon: true,
  _showMoonImage: true,
  _showMoonrise: true,
  _showMoonriseAzimuth: false,
  _showMoonset: true,
  _showMoonsetAzimuth: false,
  _showMoonphase: true,
  _showNextFullMoon: true,
  _showNextNewMoon: false,
  _showMoonDate: true,

  _prefs: null,
  _stringBundle: null,
  
  init: function() {
//    dump("in suncult.init\n");
      this._stringBundle = document.getElementById("suncult-string-bundle");
      this._prefs = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch);

      this._today = document.getElementById("suncult-today-today");

      this._sunImg = document.getElementById("suncult-sun-today-img");
      this._twilightStart = document.getElementById("suncult-twilight-start-today");
      this._sunrise = document.getElementById("suncult-sunrise-today");
      this._sunset = document.getElementById("suncult-sunset-today");
      this._sunriseAzimuth = document.getElementById("suncult-sunrise-azimuth-today");
      this._sunsetAzimuth = document.getElementById("suncult-sunset-azimuth-today");
      this._midday = document.getElementById("suncult-midday-today");
      this._twilightEnd = document.getElementById("suncult-twilight-end-today");
      this._sunShadeImg = document.getElementById("suncult-status-icon-sun");
      this._moonPhaseImg = document.getElementById("suncult-status-icon-moon");
      this._moonImg = document.getElementById("suncult-moon-today-img");
      this._moonPhase = document.getElementById("suncult-moonphase-today");
      this._nextFullMoon = document.getElementById("suncult-next-fullmoon-today");
      this._nextNewMoon = document.getElementById("suncult-next-newmoon-today");
      this._moonRise = document.getElementById("suncult-moonrise-today");
      this._moonSet = document.getElementById("suncult-moonset-today");
      this._moonRiseAz = document.getElementById("suncult-moonrise-azimuth-today");
      this._moonSetAz = document.getElementById("suncult-moonset-azimuth-today");
      this.readPreferences();
      if (!this._prefs.prefHasUserValue(this._prefLongitude) && !this._prefs.prefHasUserValue(this._prefLatitude)) {
        setTimeout(function() { this.showConfig(); }, 250);
      }
      this.updateStatusBar();
      this.schedule();
      
      Components.classes["@mozilla.org/observer-service;1"]
            .getService(Components.interfaces.nsIObserverService)
            .addObserver(this, "SunCult:Configuration", false);      
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

      var mc = this.getBoolPref(this._prefMenuConfig, true);
      document.getElementById("suncult-config").hidden = !mc;

      this._toolbar = this.getCharPref(this._prefBar, "status-bar");
      this._toolbarPosition = this.getIntPref(this._prefBarPosition, -1);

      this._showSun = this.getBoolPref(this._prefShowSun, true);
      this._showSunImage = this.getBoolPref(this._prefShowSunImage, true);
      this._showSunTwilightStart = this.getBoolPref(this._prefShowSunTwilightStart, true);
      this._showSunTwilightEnd = this.getBoolPref(this._prefShowSunTwilightEnd, true);
      this._showSunrise = this.getBoolPref(this._prefShowSunrise, true);
      this._showSunset = this.getBoolPref(this._prefShowSunset, true);
      this._showSunriseAzimuth = this.getBoolPref(this._prefShowSunriseAzimuth, true);
      this._showSunsetAzimuth = this.getBoolPref(this._prefShowSunsetAzimuth, true);
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
      this._move();
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
      document.getElementById("suncult-sun-today").collapsed = !this._showSun;
      document.getElementById("suncult-sun-today-img-box").collapsed = !this._showSunImage;
      document.getElementById("suncult-row-twilightStart-today").collapsed = !this._showSunTwilightStart;
      document.getElementById("suncult-row-sunrise-today").collapsed = !this._showSunrise;
      document.getElementById("suncult-row-midday-today").collapsed = !this._showMidday;
      document.getElementById("suncult-row-sunset-today").collapsed = !this._showSunset;
      document.getElementById("suncult-row-sunrise-azimuth-today").collapsed = !this._showSunriseAzimuth;
      document.getElementById("suncult-row-sunset-azimuth-today").collapsed = !this._showSunsetAzimuth;
      document.getElementById("suncult-row-twilightEnd-today").collapsed = !this._showSunTwilightEnd;

      document.getElementById("suncult-moon-today").collapsed = !this._showMoon;
      document.getElementById("suncult-moon-today-img-box").collapsed = !this._showMoonImage;
      document.getElementById("suncult-row-moonrise-today").collapsed = !this._showMoonrise;
      document.getElementById("suncult-row-moonrise-azimuth-today").collapsed = !this._showMoonriseAzimuth;
      document.getElementById("suncult-row-moonset-today").collapsed = !this._showMoonset;
      document.getElementById("suncult-row-moonset-azimuth-today").collapsed = !this._showMoonsetAzimuth;
      document.getElementById("suncult-row-moonphase-today").collapsed = !this._showMoonphase;
      document.getElementById("suncult-row-nextFullMoon-today").collapsed = !this._showNextFullMoon;
      document.getElementById("suncult-row-nextNewMoon-today").collapsed = !this._showNextNewMoon;

      document.getElementById("suncult-separator-today").collapsed = this._showMoon ^ this._showSun;

      // Align displayed icon to match configured features to be shown - also saves UI space
      if ( ! this._showMoon && ! this._showSun ) {
	  // If both off force traditional 'dual icon'
	  document.getElementById("suncult-status-icon-sun").hidden = false;
	  document.getElementById("suncult-status-icon-moon").hidden = false;
	  document.getElementById("suncult-status-icon-moon").left = 12;
      } else {
	  document.getElementById("suncult-status-icon-sun").hidden = !this._showSun;
	  document.getElementById("suncult-status-icon-moon").hidden = !this._showMoon;
	  // Move Moon a bit to the right if the sun is also shown
	  if ( this._showSun && this._showSun )
	      document.getElementById("suncult-status-icon-moon").left = 12;
	  else
	      document.getElementById("suncult-status-icon-moon").left = 0;
      }

  },
  
  _move: function() {
      var toolbar = document.getElementById(this._toolbar);
      var box = document.getElementById("suncult-box");
      var position = this._toolbarPosition;
      
      if (!toolbar) {
          this._prefs.setCharPref(this._prefBar, "status-bar");
          this._prefs.setIntPref(this._prefBarPosition, -1);
          return;
      };
      
      // bail if it is in the right place
      if (this._indexOf(toolbar,box) == position)
        return;
  
      //remove us from parent
      box.parentNode.removeChild(box);
      
      //make sure we have the right element type
      var newbox = null;
      if (toolbar.localName == "statusbar") {
        if (box.localName != "statusbarpanel")
          newbox = document.createElement("statusbarpanel");
      } else {
        if (box.localName == "statusbarpanel")
          newbox = document.createElement("hbox");    
      };
      
      //append children of old box
      if (newbox) {
        newbox.setAttribute("id", "suncult-box");
        newbox.setAttribute("class", "chromeclass-toolbar-additional");
        while (box.hasChildNodes())
          newbox.appendChild(box.firstChild);      
      } else
        newbox = box;
      
      //insert us in correct place
      this._insertAtIndex(toolbar, newbox, position);
  },

  _indexOf: function(aParent, aChild){
    // -1 if it does not exist
    var children = aParent.childNodes;
    for (var x=0; x<children.length; x++)
      if (children[x] == aChild)
        return (x == children.length - 1) ? -1 : x;
   
    return null;
  },
  
  _insertAtIndex: function(aParent, aChild, aIndex){
    var children = aParent.childNodes;
    if ((children.length == 0) || (aIndex >= children.length) || (aIndex < 0))
      aParent.appendChild(aChild);
    else
      aParent.insertBefore(aChild, children[aIndex]);
  },
  
  showConfig: function() {
    window.openDialog("chrome://suncult/content/config.xul", "Suncult:Configuration", "chrome,resizable,titlebar,toolbar");
  },

  showCalendar: function() {
    window.openDialog("chrome://suncult/content/calendar.xul", "Suncult:Calendar", "chrome,resizable,titlebar,toolbar");
  },
  
  onPopupShowing: function(popup) {
    this._today.value = new Date().toLocaleDateString();
    this.updatePopupSun(popup);
    this.updatePopupMoon(popup);
  },
  
  updatePopupSun: function(popup) {
/*    dump("lat: " + this._latitude + "\n");
      dump("long: " + this._longitude + "\n");
      dump("timezone: " + this._timezone + "\n");
      dump("timeformat: " + this._timeFormat + "\n"); */
      var today = new Date();
      var lat = parseFloat(this._latitude);
      var lon = parseFloat(this._longitude);
      var result = suncultCalcSun.formValues(lat, lon, today, this._timezone, this._timeFormat, this._srAngle, this._twAngle);
      if (result[0] == "all") {
          this._twilightStart.value = this.getResource(this._resAllTwilight)
      } else if (result[0] == "no") {
          this._twilightStart.value = this.getResource(this._resNoTwilight)
      } else {
          this._twilightStart.value = result[0];
      }
      if (result[1] == "all") {
          this._twilightEnd.value = this.getResource(this._resAllTwilight)
      } else if (result[1] == "no") {
          this._twilightEnd.value = this.getResource(this._resNoTwilight)
      } else {
          this._twilightEnd.value = result[1];
      }
      this._sunrise.value = result[2];
      this._sunset.value = result[3];
      this._midday.value = result[4];
      this._sunriseAzimuth.value = result[5];
      this._sunsetAzimuth.value = result[6];

      this._sunImg.src = this.getSunImageSrc(result[7], 64);
  },
  
  updatePopupMoon: function(popup) {
      var today = new Date();
      var lat = parseFloat(this._latitude);
      var lon = parseFloat(this._longitude);
      this._moonPhase.value = this.getResource(this._resMoonPrefix + suncultCalcMoon.phaseName(today));
      var dfm = suncultCalcMoon.daysToFullMoon(today);
      var d = Math.floor(dfm);
      var h = Math.floor((dfm - d) * 24);

      var str = null;

      var myDate1;
      if (this._showMoonDate) {
          myDate1 = new Date();
          myDate1.setDate(myDate1.getDate() + d);
          myDate1.setHours(myDate1.getHours() + h);
          str = myDate1.toLocaleDateString() + " " + myDate1.toLocaleTimeString();
	      // Don't need to the second precision for date display, so hack off last three characters
          this._nextFullMoon.value = str.substr (0, str.length - 3);
      } else {
          this._nextFullMoon.value = d + "d " + h + "h";
      }

      var dnm = suncultCalcMoon.daysToNewMoon(today);
      d = Math.floor(dnm);
      h = Math.floor((dnm - d) * 24);

      var myDate2;
      if (this._showMoonDate) {
          myDate2 = new Date();
          myDate2.setDate(myDate2.getDate() + d);
          myDate2.setHours(myDate2.getHours() + h);
          str = myDate2.toLocaleDateString() + " " + myDate2.toLocaleTimeString();
          // Don't need to the second precision for date display, so hack off last three characters
          this._nextNewMoon.value = str.substr (0, str.length - 3);
      } else {
          this._nextNewMoon.value = d + "d " + h + "h";
      }

      this._moonImg.src = this.getMoonImageSrc(today, 64);

      var result = suncultCalcMoon.riseset(parseFloat(this._latitude), parseFloat(this._longitude), today, this._timezone, this._timeFormat);
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

    getSunImageSrc: function(suntype, size) {
	var dir = "chrome://suncult/content/images/";
	var base = "sun_";
	var ext = ".png";

	if (suntype == 1) {
	    return dir + base + "riseset_" + size + ext;
	}
	else if (suntype == 2) {
	    return dir + base + "night_" + size + ext;
	}
	else {
	    // Normal daytime
	    return dir + base + size + ext;
	}
    },

    updateStatusBar: function() {
	var moonimgsrc = this.getMoonImageSrc(new Date(), 20);
	this._moonPhaseImg.src = moonimgsrc;

	//
	var today = new Date();
	var lat = parseFloat(this._latitude);
	var lon = parseFloat(this._longitude);
	var result = suncultCalcSun.formValues(lat, lon, today, this._timezone, this._timeFormat, this._srAngle, this._twAngle);

	var sunimgsrc = this.getSunImageSrc(result[7], 20);
	this._sunShadeImg.src = sunimgsrc;
    },
  
  showAlerts: function() {
  },
  
  trigger: function() {
    this.updateStatusBar();
    this.showAlerts();
    this.schedule();
  },
  
  schedule: function() {
    // Update every minute
    setTimeout(function() { this.trigger(); }, 60000);
  }
};

window.addEventListener("load", function(e) { suncult.init(e); }, false); 
