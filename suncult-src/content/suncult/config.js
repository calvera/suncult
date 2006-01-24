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
  }
  
};

window.addEventListener("load", function(e) { suncultConfig.init(e); }, false); 
