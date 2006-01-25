var suncultConfig = {
	_stringBundle: null,
	_numberValidation: /^-?\d+$/,

  init: function() {
    // initialization code
    this._stringBundle = document.getElementById("string-bundle");
    this.initialized = true;
  },

  validate: function(event) {
    latitude = document.getElementById("latitude").value;
    if (!this._numberValidation.test(latitude)) {
    	event.preventDefault();
    	alert(this._stringBundle.getString("suncult.badLatitude"));
    	return false;
    	} 
    	
    longitude = document.getElementById("longitude").value;
    if (!this._numberValidation.test(longitude)) {
    	event.preventDefault();
    	alert(this._stringBundle.getString("suncult.badLongitude"));
    	return false;
    	} 
		
  	return true;
  },
  
  onSelectCity: function(event) {
    var tree = event.target;
  
    if (!tree.view.isContainer(tree.currentIndex)) {
      var latitude = document.getElementById("latitude");
      var longitude = document.getElementById("longitude");
      var latcol = tree.columns ? tree.columns['latitude-column'] : 'latitude-column';
      var longcol = tree.columns ? tree.columns['longitude-column'] : 'longitude-column';
    
      var lat = tree.view.getCellText(tree.currentIndex, latcol);
      var lon = tree.view.getCellText(tree.currentIndex, longcol);
    
      latitude.value = lat;
      longitude.value = lon;
    }
  }
  
};

window.addEventListener("load", function(e) { suncultConfig.init(e); }, false); 
