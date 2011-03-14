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
  
  _today: null,

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

  _prefs: null,
  _stringBundle: null,
  
  init: function() {
//    dump("in suncult.init\n");
    with (this) {
      _stringBundle = document.getElementById("suncult-string-bundle");
      _prefs = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch);

      _today = document.getElementById("suncult-today-today");

      _twilightStart = document.getElementById("suncult-twilight-start-today");
      _sunrise = document.getElementById("suncult-sunrise-today");
      _sunset = document.getElementById("suncult-sunset-today");
      _sunriseAzimuth = document.getElementById("suncult-sunrise-azimuth-today");
      _sunsetAzimuth = document.getElementById("suncult-sunset-azimuth-today");
      _midday = document.getElementById("suncult-midday-today");
      _twilightEnd = document.getElementById("suncult-twilight-end-today");
      _moonPhaseImg = document.getElementById("suncult-status-icon-moon");
      _moonImg = document.getElementById("suncult-moon-today-img");
      _moonPhase = document.getElementById("suncult-moonphase-today");
      _nextFullMoon = document.getElementById("suncult-next-fullmoon-today");
      _nextNewMoon = document.getElementById("suncult-next-newmoon-today");
      _moonRise = document.getElementById("suncult-moonrise-today");
      _moonSet = document.getElementById("suncult-moonset-today");
      _moonRiseAz = document.getElementById("suncult-moonrise-azimuth-today");
      _moonSetAz = document.getElementById("suncult-moonset-azimuth-today");
      readPreferences();
      if (!_prefs.prefHasUserValue(_prefLongitude) || !_prefs.prefHasUserValue(_prefLatitude)) {
        var module = this;
        setTimeout(function() { module.showConfig(); }, 250);
        }
      updateStatusBar();
      schedule();
      
      Components.classes["@mozilla.org/observer-service;1"]
            .getService(Components.interfaces.nsIObserverService)
            .addObserver(this, "SunCult:Configuration", false);      
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

      var mc = getBoolPref(_prefMenuConfig, true);
      document.getElementById("suncult-config").hidden = !mc;

      _toolbar = getCharPref(_prefBar, "status-bar");
      _toolbarPosition = getIntPref(_prefBarPosition, -1);

      _showSun = getBoolPref(_prefShowSun, true);
      _showSunImage = getBoolPref(_prefShowSunImage, true);
      _showSunTwilightStart = getBoolPref(_prefShowSunTwilightStart, true);
      _showSunTwilightEnd = getBoolPref(_prefShowSunTwilightEnd, true);
      _showSunrise = getBoolPref(_prefShowSunrise, true);
      _showSunset = getBoolPref(_prefShowSunset, true);
      _showSunriseAzimuth = getBoolPref(_prefShowSunriseAzimuth, true);
      _showSunsetAzimuth = getBoolPref(_prefShowSunsetAzimuth, true);
      _showMidday = getBoolPref(_prefShowMidday, false);

      _showMoon = getBoolPref(_prefShowMoon, true);
      _showMoonImage = getBoolPref(_prefShowMoonImage, true);
      _showMoonrise = getBoolPref(_prefShowMoonrise, true);
      _showMoonriseAzimuth = getBoolPref(_prefShowMoonriseAzimuth, false);
      _showMoonset = getBoolPref(_prefShowMoonset, true);
      _showMoonsetAzimuth = getBoolPref(_prefShowMoonsetAzimuth, false);
      _showMoonphase = getBoolPref(_prefShowMoonphase, true);
      _showNextFullMoon = getBoolPref(_prefShowNextFullMoon, true);
      _showNextNewMoon = getBoolPref(_prefShowNextNewMoon, false);
      _showMoonDate = getBoolPref(_prefShowMoonDate, true);

      _showHide();
      _move();
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

  _showHide: function() {
    with (this) {
      document.getElementById("suncult-sun-today").collapsed = !_showSun;
      document.getElementById("suncult-sun-today-img-box").collapsed = !_showSunImage;
      document.getElementById("suncult-row-twilightStart-today").collapsed = !_showSunTwilightStart;
      document.getElementById("suncult-row-sunrise-today").collapsed = !_showSunrise;
      document.getElementById("suncult-row-midday-today").collapsed = !_showMidday;
      document.getElementById("suncult-row-sunset-today").collapsed = !_showSunset;
      document.getElementById("suncult-row-sunrise-azimuth-today").collapsed = !_showSunriseAzimuth;
      document.getElementById("suncult-row-sunset-azimuth-today").collapsed = !_showSunsetAzimuth;
      document.getElementById("suncult-row-twilightEnd-today").collapsed = !_showSunTwilightEnd;

      document.getElementById("suncult-moon-today").collapsed = !_showMoon;
      document.getElementById("suncult-moon-today-img-box").collapsed = !_showMoonImage;
      document.getElementById("suncult-row-moonrise-today").collapsed = !_showMoonrise;
      document.getElementById("suncult-row-moonrise-azimuth-today").collapsed = !_showMoonriseAzimuth;
      document.getElementById("suncult-row-moonset-today").collapsed = !_showMoonset;
      document.getElementById("suncult-row-moonset-azimuth-today").collapsed = !_showMoonsetAzimuth;
      document.getElementById("suncult-row-moonphase-today").collapsed = !_showMoonphase;
      document.getElementById("suncult-row-nextFullMoon-today").collapsed = !_showNextFullMoon;
      document.getElementById("suncult-row-nextNewMoon-today").collapsed = !_showNextNewMoon;

      document.getElementById("suncult-separator-today").collapsed = _showMoon ^ _showSun;

      // Align displayed icon to match configured features to be shown - also saves UI space
      if ( ! _showMoon && ! _showSun ) {
	  // If both off force traditional 'dual icon'
	  document.getElementById("suncult-status-icon-sun").hidden = false;
	  document.getElementById("suncult-status-icon-moon").hidden = false;
	  document.getElementById("suncult-status-icon-moon").left = 12;
      } else {
	  document.getElementById("suncult-status-icon-sun").hidden = !_showSun;
	  document.getElementById("suncult-status-icon-moon").hidden = !_showMoon;
	  // Move Moon a bit to the right if the sun is also shown
	  if ( _showSun && _showSun )
	      document.getElementById("suncult-status-icon-moon").left = 12;
	  else
	      document.getElementById("suncult-status-icon-moon").left = 0;
      }

    }
  },
  
  _move: function() {
    with (this) {
      var toolbar = document.getElementById(_toolbar);
      var box = document.getElementById("suncult-box");
      var position = _toolbarPosition;
      
      if (!toolbar) {
        _prefs.setCharPref(_prefBar, "status-bar");
        _prefs.setIntPref(_prefBarPosition, -1);
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
    }
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
    with (this) {
/*    dump("lat: " + _latitude + "\n");
      dump("long: " + _longitude + "\n");
      dump("timezone: " + _timezone + "\n");
      dump("timeformat: " + _timeFormat + "\n"); */
      var today = new Date();
      var lat = parseFloat(_latitude);
      var lon = parseFloat(_longitude);
      var result = suncultCalcSun.formValues(lat, lon, today, _timezone, _timeFormat, _srAngle, _twAngle);
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
  
  updatePopupMoon: function(popup) {
    with (this) {
      var today = new Date();
      var lat = parseFloat(_latitude);
      var lon = parseFloat(_longitude);
      _moonPhase.value = getResource(_resMoonPrefix + suncultCalcMoon.phaseName(today));
      var dfm = suncultCalcMoon.daysToFullMoon(today);
      var d = Math.floor(dfm);
      var h = Math.floor((dfm - d) * 24);

      var myDate = new Date();
      var str = null;

      if (_showMoonDate) {
	  myDate.setDate(today.getDate() + d);
	  myDate.setHours(myDate.getHours() + h);
	  str = myDate.toLocaleDateString() + " " + myDate.toLocaleTimeString();
	  // Don't need to the second precision for date display, so hack off last three characters
	  _nextFullMoon.value = str.substr (0, str.length - 3);
      } else {
	  _nextFullMoon.value = d + "d " + h + "h";
      }

      var dnm = suncultCalcMoon.daysToNewMoon(today);
      d = Math.floor(dnm);
      h = Math.floor((dnm - d) * 24);

      if (_showMoonDate) {
	  // Reset myDate
	  myDate = today;
	  myDate.setDate(today.getDate() + d);
	  myDate.setHours(myDate.getHours() + h);
	  str = myDate.toLocaleDateString() + " " + myDate.toLocaleTimeString();
	  // Don't need to the second precision for date display, so hack off last three characters
	  _nextNewMoon.value = str.substr (0, str.length - 3);
      } else {
	  _nextNewMoon.value = d + "d " + h + "h";
      }

      _moonImg.src = getMoonImageSrc(today, 64);

      var result = suncultCalcMoon.riseset(parseFloat(_latitude),parseFloat(_longitude), today, _timezone, _timeFormat);
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
    module = this;
    setTimeout(function() { module.trigger(); }, 60000);
  }
};

window.addEventListener("load", function(e) { suncult.init(e); }, false); 
