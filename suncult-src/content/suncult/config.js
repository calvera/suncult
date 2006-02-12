var suncultConfig = {
  _stringBundle: null,
  _latitude: null,
  _longitude: null,
  _latitudeEdit: null,
  _longitudeEdit: null,

  init: function() {
    // initialization code
    // dump("suncultConfig.init\n");
    with (this) {
      _stringBundle = document.getElementById("string-bundle");
      this.initialized = true;
      _latitude = document.getElementById("pref-latitude");
      _longitude = document.getElementById("pref-longitude");
      _latitudeEdit = document.getElementById("latitude-edit");
      _longitudeEdit = document.getElementById("longitude-edit");
      _latitudeEdit.value = this.formatValue(_latitude.value, "N", "S");
      _longitudeEdit.value = this.formatValue(_longitude.value, "E", "W");
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
  }

};

window.addEventListener("load", function(e) { suncultConfig.init(e); }, false);
