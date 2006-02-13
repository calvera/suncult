var suncultConfig = {
  _stringBundle: null,
  _latitude: null,
  _longitude: null,
  _latitudeEdit: null,
  _longitudeEdit: null,
  _positionMax: null,
  _errors: null,
  
  init: function() {
    // initialization code
    // dump("suncultConfig.init\n");
    with (this) {
      _errors = new Array();
      _stringBundle = document.getElementById("string-bundle");
      this.initialized = true;
      _latitude = document.getElementById("pref-latitude");
      _longitude = document.getElementById("pref-longitude");
      _latitudeEdit = document.getElementById("latitude-edit");
      _longitudeEdit = document.getElementById("longitude-edit");
      _latitudeEdit.value = this.formatValue(_latitude.value, "N", "S");
      _longitudeEdit.value = this.formatValue(_longitude.value, "E", "W");
      populatePositions();
    }
  },

  onSelectCity: function(event) {
    dump("suncultConfig.onSelectCity\n");
    var tree = event.target;

    if (!tree.view.isContainer(tree.currentIndex)) {
      var latcol = tree.columns ? tree.columns['latitude-column'] : 'latitude-column';
      var longcol = tree.columns ? tree.columns['longitude-column'] : 'longitude-column';

      var lat = tree.view.getCellText(tree.currentIndex, latcol);
      var lon = tree.view.getCellText(tree.currentIndex, longcol);

      this._latitudeEdit.value = lat;
      this.oninputLatitude(event);

      this._longitudeEdit.value = lon;
      this.oninputLongitude(event);
    }
  },

  oninputLatitude: function(event) {
//    dump("suncultConfig.oninputLatitude\n");
    var v = new String(this._latitudeEdit.value);
    var r = null;

    if (v.match(/^\s*-?\d*([.,]\d*)?\s*$/)) {  //-50.30
      r = parseFloat(v);
    }

    var m = v.match(/^\s*(\d+)([NS])\s*(\d*)\s*$/i)
    if (m) { //49n20
      r = parseFloat(m[1]) + (m[3] != "" ? parseFloat(m[3]) / 60 : 0);
      if (m[2] == 's' || m[2] == 'S') {
        r = -r;
      }
    }

    var m = v.match(/^\s*(\d+)\D*(\d*)\D*(\d*([.,]\d*)?)\D*([NS])\s*$/i);
    if (m) { //13°N, 13° 19'N and 13°19'43"N
      r = parseFloat(m[1]) + (m[2] != "" ? parseFloat(m[2]) / 60 : 0) + (m[3] != "" ? parseFloat(m[3]) / 60 / 60 : 0);
      if (m[5] == 's' || m[5] == 'S') {
        r = -r;
      }
    }

    if (this.validate(r, -90, 90)) {
      this._latitude.value = r;
    }
  },

  oninputLongitude: function(event) {
//    dump("suncultConfig.oninputLongitude\n");
    var v = this._longitudeEdit.value;
    var r = null;

    if (v.match(/^\s*-?\d*([.,]\d*)?\s*$/)) {  //-50.30
      r = parseFloat(v);
    }

    var m = v.match(/^\s*(\d+)([WE])\s*(\d*)\s*$/i)
    if (m) { //49w20
      r = parseFloat(m[1]) + (m[3] != "" ? parseFloat(m[3]) / 60 : 0);
      if (m[2] == 'W' || m[2] == 'w') {
        r = -r;
      }
    }

    var m = v.match(/^\s*(\d+)\D*(\d*)\D*(\d*([.,]\d*)?)\D*([WE])\s*$/i);
    if (m) { //13°E, 13° 19'W and 13°19'43"W
      r = parseFloat(m[1]) + (m[2] != "" ? parseFloat(m[2]) / 60 : 0) + (m[3] != "" ? parseFloat(m[3]) / 60 / 60 : 0);
      if (m[5] == 'W' || m[5] == 'w') {
        r = -r;
      }
    }

    if (this.validate(r, -180, 180)) {
      this._longitude.value = r;
    }
  },

  validate: function(v, min, max) {
    var r = v != null && v >= min && v <= max;
    document.documentElement.getButton("accept").disabled = !r;
    return r;
  },

  formatValue: function(value, positive, negative) {
    var absValue = value <0 ? -value : value;
    var result = Math.floor(absValue);
    result += value < 0 ? negative : positive;
    var min = Math.floor( absValue * 60 % 60);
    result += min > 0 ? min : "";
    return result;
  },

  populatePositions: function() {
    var barid = document.getElementById("suncult-list-bars").selectedItem.getAttribute("id");
    var win = window.opener;
    var bar = win.document.getElementById(barid);

    if (!bar)
      this._positionMax = 0;
    else {
      var len = bar.childNodes.length;
    
      //don't include ourself in count
      if (win.document.getElementById("suncult-box") && win.document.getElementById("suncult-box").parentNode == bar)
        len--;
    
      this._positionMax = len;
        
    }

    var val = document.getElementById("pref-bar-position").value;
    var val2 = document.getElementById("pref-bar").value;
    var text = document.getElementById("suncult-text-position");
    var radio = document.getElementsByAttribute("group", "position");
    var group = document.getElementById("suncult-group-position");
    var x, el;
    
    //set max value
    text.value = this._positionMax;
    
    //mark always last
    if (val == -1) {
      for (x=0; x < radio.length; x++) {
        if (parseInt(radio[x].value) == val) {
          group.selectedItem = radio[x];
          break;
        }
      }
    }
    
    //mark specific position
    else {
      for (x=0; x < radio.length; x++) {
        if (parseInt(radio[x].value) != -1) {
          group.selectedItem = radio[x];
          break;
        }
      }    
      if (barid != val2) {
        text.value = this._positionMax;
      } else {
        if (val < 0)
          text.value = this._positionMax;
        else if (val > this._positionMax)
          text.value = 0;
        else
          text.value = val; 
      }
    }
    
    // update the error label
    el = document.getElementById("suncult-text-position-valid");
    el.setAttribute("value", "0 - "+this._positionMax);
    
    //revalidate position
    setTimeout("suncultConfig.validatePos()", 5);
  },
    
  validatePos: function() {
    var pref = document.getElementById("pref-bar-position");
    var position = document.getElementById("suncult-group-position");
    var r;
    if (parseInt(position.selectedItem.value) == -1) {
      pref.value = -1;
      r = true;
    } else {
      var v = pref.value = parseInt(document.getElementById("suncult-text-position").value); 
      r = v != null && v >= 0 && v <= this._positionMax;
    }
    document.documentElement.getButton("accept").disabled = !r;
    document.getElementById("suncult-text-position-valid").hidden = r;
    return r;
  }
    
};

window.addEventListener("load", function(e) { suncultConfig.init(e); }, false);
