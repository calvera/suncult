var suncult = {
  _prefLatitude: "extensions.suncult.latitude",
  _prefLongitude: "extensions.suncult.longitude",
  _prefTimezone: "extensions.suncult.timezone",
  _prefTimeFormat: "extensions.suncult.timeformat",
  _prefTwilightAngle: "extensions.suncult.twAngle",
  _prefSetRiseAngle: "extensions.suncult.srAngle",
  _prefBar: "extensions.suncult.bar",
  _prefBarPosition: "extensions.suncult.bar.position",
  _prefMenuConfig: "extensions.suncult.config.menu",
  
  _resNoMoonrise: "suncult.noMoonrise",
  _resNoMoonset: "suncult.noMoonset",
  _resMoonPrefix: "suncult.moon.",
  
  _twilightStart: null,
  _sunrise: null,
  _sunset: null,
  _twilightEnd: null,
  _moonPhaseImg: null,
  _moonImg: null,
  _moonPhase: null,
  _nextFullMoon: null,
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
      _nextFullMoon = document.getElementById("suncult-next-fullmoon");
      _moonRise = document.getElementById("suncult-moonrise");
      _moonSet = document.getElementById("suncult-moonset");
      _moonRiseAz = document.getElementById("suncult-moonrise-azimuth");
      _moonSetAz = document.getElementById("suncult-moonset-azimuth");
      readPreferences();
      if (!_prefs.prefHasUserValue(_prefLongitude) || !_prefs.prefHasUserValue(_prefLatitude)) {
        var module = this;
        setTimeout(function() { module.showConfig(); }, 250);
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
      return null;
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

      var mc = prefs.getBoolPref(_prefMenuConfig);
      document.getElementById("suncult-config").hidden = !mc;

      _move();
    }
  },

  _move: function() {
    with (this) {
      var toolbar = document.getElementById(_prefs.getCharPref(_prefBar));
      var box = document.getElementById("suncult-box");
      var position = _prefs.getIntPref(_prefBarPosition);
      
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
    window.openDialog("chrome://suncult/content/config.xul", "Suncult:Configuration", "chrome,resizable,titlebar,toolbar,modal");
  },
  
  onPopupShowing: function(popup) {
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
      var h = Math.floor((dfm - d) * 24)
      _nextFullMoon.value = d + "d " + h + "h";
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
