var suncultCalc = {
// Global variables:
  
twAngle : -6.0,    // For civil twilight, set to -12.0 for
                       // nautical, and -18.0 for astr. twilight

srAngle : -35.0/60.0,    // For sunrise/sunset

sRiseT : null,        // For sunrise/sunset times
sSetT : null,
srStatus : null,

twStartT : null,      // For twilight times
twEndT : null,
twStatus : null,

sDIST : null,     // Solar distance, astronomical units
sRA : null,       // Sun's Right Ascension
sDEC : null,      // Sun's declination

sLON : null,      // True solar longitude

//-------------------------------------------------------------
// Some conversion factors between radians and degrees

RADEG : 180.0 / Math.PI,
DEGRAD : Math.PI / 180.0,

//-------------------------------------------------------------
// A function to compute the number of days elapsed since
// 2000 Jan 0.0  (which is equal to 1999 Dec 31, 0h UT)
//-------------------------------------------------------------
dayDiff2000 : function(y,m,d){
  return (367.0*(y)-((7*((y)+(((m)+9)/12)))/4)+
          ((275*(m))/9)+(d)-730530.0);
},




//-------------------------------------------------------------
// The trigonometric functions in degrees

sind : function(x) { return Math.sin((x)*this.DEGRAD); },
cosd : function(x) { return Math.cos((x)*this.DEGRAD); },
tand : function(x) { return Math.tan((x)*this.DEGRAD); },
atand : function(x) { return (this.RADEG*Math.atan(x)); },
asind : function(x) { return (this.RADEG*Math.asin(x)); },
acosd : function(x) { return (this.RADEG*Math.acos(x)); },

atan2d : function(y,x){
  var at2 = (this.RADEG*Math.atan(y/x));

  if( x < 0 && y < 0)
    at2 -= 180;

  else if( x < 0 && y > 0)
    at2 += 180;

  return at2;
},


//-------------------------------------------------------------
// This function computes times for sunrise/sunset. 
// Sunrise/sunset is considered to occur when the Sun's upper
// limb is 35 arc minutes below the horizon (this accounts for
// the refraction of the Earth's atmosphere).
//-------------------------------------------------------------
sunRiseSet : function(year,month,day,lat,lon){
  return this.sunTimes( year, month, day, lat, lon, this.srAngle, 1);
},



//-------------------------------------------------------------
// This function computes the start and end times of civil
// twilight. Civil twilight starts/ends when the Sun's center
// is 6 degrees below the horizon.
//-------------------------------------------------------------
civTwilight : function(year,month,day,lat,lon){
  return this.sunTimes( year, month, day, lat, lon, this.twAngle, 0);
},



//-------------------------------------------------------------
// The main function for sun rise/set times
//
// year,month,date = calendar date, 1801-2099 only.
// Eastern longitude positive, Western longitude negative
// Northern latitude positive, Southern latitude negative
//
// altit = the altitude which the Sun should cross. Set to
//         -35/60 degrees for rise/set, -6 degrees for civil,
//         -12 degrees for nautical and -18 degrees for
//         astronomical twilight.
//
// sUppLimb: non-zero -> upper limb, zero -> center. Set to
//           non-zero (e.g. 1) when computing rise/set times,
//           and to zero when computing start/end of twilight.
//
// Status:  0 = sun rises/sets this day, times stored in Global
//              variables
//          1 = sun above the specified "horizon" 24 hours.
//              Rising set to time when the sun is at south,
//              minus 12 hours while Setting is set to the
//              south time plus 12 hours.
//         -1 = sun is below the specified "horizon" 24 hours.
//              Rising and Setting are both set to the time
//              when the sun is at south.
//-------------------------------------------------------------
sunTimes : function(year, month, day, lat, lon, altit, sUppLimb){
  var dayDiff;    // Days since 2000 Jan 0.0 (negative before)
  var sRadius;    // Sun's apparent radius
  var diuArc;     // Diurnal arc
  var sSouthT;    // Time when Sun is at south
  var locSidT;    // Local sidereal time

  var stCode = 0     // Status code from function - usually 0

      /* Compute dayDiff of 12h local mean solar time */
      
  dayDiff = this.dayDiff2000(year,month,day) + 0.5 - lon/360.0;

      /* Compute local sideral time of this moment */

  locSidT = this.revolution( this.GMST0(dayDiff) + 180.0 + lon );

      /* Compute Sun's RA + Decl at this moment */

  this.sunRaDec( dayDiff );

      /* Compute time when Sun is at south - in hours UT */
      

  sSouthT = 12.0 - this.rev180(locSidT - this.sRA)/15.0;


      /* Compute the Sun's apparent radius, degrees */

  sRadius = 0.2666 / this.sDIST;


      /* Do correction to upper limb, if necessary */

  if ( sUppLimb != 0)            // For surise/sunset
    altit -= sRadius;


      /* Compute the diurnal arc that the Sun traverses */
      /* to reach the specified altitude altit:         */
  {
     var cost;
     cost = ( this.sind(altit) - this.sind(lat) * this.sind(this.sDEC) ) /
             ( this.cosd(lat) * this.cosd(this.sDEC) );

     if ( cost >= 1.0 )
     {
       stCode = -1;
       diuArc = 0.0;       // Sun always below altit
     }

     else if ( cost <= -1.0 )
     {
       stCode = 1;
       diuArc = 12.0;      // Sun always above altit
     }

     else {
       diuArc = this.acosd(cost)/15.0;   // The diurnal arc, hours
      }
       
  }

      /* Store rise and set times - in hours UT */

  if ( sUppLimb != 0)       // For sunrise/sunset
  {
    this.sRiseT = sSouthT - diuArc;

    if(this.sRiseT < 0)        // Sunrise day before
      this.sRiseT += 24;
      
    this.sSetT  = sSouthT + diuArc;

    if(this.sSetT > 24)        // Sunset next day
      this.sSetT -= 24;

    this.srStatus = stCode;
  }
  else                      // For twilight times
  {
    this.twStartT = sSouthT - diuArc;

    if(this.twStartT < 0)
      this.twStartT += 24;
      
    this.twEndT  = sSouthT + diuArc;

    if(this.twEndT > 24)
      this.twEndT -= 24;

    this.twStatus = stCode;
  }
}, //================== sunTimes() =====================


//-------------------------------------------------------------
// This function computes the sun's spherical coordinates
//-------------------------------------------------------------
sunRaDec : function(dayDiff){
  var eclObl;   // Obliquity of ecliptic
                // (inclination of Earth's axis)
  var x;
  var y;
  var z;

      /* Compute Sun's ecliptical coordinates */

  this.sunPos( dayDiff );

      /* Compute ecliptic rectangular coordinates (z=0) */

  x = this.sDIST * this.cosd(this.sDEC);

  y = this.sDIST * this.sind(this.sDEC);

      /* Compute obliquity of ecliptic */
      /* (inclination of Earth's axis) */

//  eclObl = 23.4393 - 3.563E-7 * dayDiff;

  eclObl = 23.4393 - 3.563/10000000 * dayDiff;  // for Opera

      /* Convert to equatorial rectangular coordinates */
      /* - x is unchanged                               */

  z = y * this.sind(eclObl);
  y = y * this.cosd(eclObl);

      /* Convert to spherical coordinates */

  this.sRA = this.atan2d( y, x );
  this.sDEC = this.atan2d( z, Math.sqrt(x*x + y*y) );

}, //================= sunRaDec() =======================



//-------------------------------------------------------------
// Computes the Sun's ecliptic longitude and distance
// at an instant given in dayDiff, number of days since
// 2000 Jan 0.0.  The Sun's ecliptic latitude is not
// computed, since it's always very near 0. 
//-------------------------------------------------------------
sunPos : function(dayDiff){
  var M;       // Mean anomaly of the Sun
  var w;       // Mean longitude of perihelion
               // Note: Sun's mean longitude = M + w
  var e;       // Eccentricity of Earth's orbit
  var eAN;     // Eccentric anomaly
  var x;       // x, y coordinates in orbit
  var y;
  var v;       // True anomaly

      /* Compute mean elements */

  M = this.revolution( 356.0470 + 0.9856002585 * dayDiff );

//  w = 282.9404 + 4.70935E-5 * dayDiff;
//  e = 0.016709 - 1.151E-9 * dayDiff;

  w = 282.9404 + 4.70935/100000 * dayDiff;    // for Opera
  e = 0.016709 - 1.151/1000000000 * dayDiff;  // for Opera

      /* Compute true longitude and radius vector */

  eAN = M + e * this.RADEG * this.sind(M) * ( 1.0 + e * this.cosd(M) );

  x = this.cosd(eAN) - e;
  y = Math.sqrt( 1.0 - e*e ) * this.sind(eAN);

  this.sDIST = Math.sqrt( x*x + y*y );    // Solar distance

  v = this.atan2d( y, x );                // True anomaly

  this.sDEC = v + w;                      // True solar longitude

  if ( this.sDEC >= 360.0 )
    this.sDEC -= 360.0;                   // Make it 0..360 degrees

}, //=================== sunPos() =============================


INV360 : 1.0 / 360.0,


//-------------------------------------------------------------
// Reduce angle to within 0..360 degrees
//-------------------------------------------------------------
revolution : function( x ){
  return (x - 360.0 * Math.floor( x * this.INV360 ));
},


//-------------------------------------------------------------
// Reduce angle to within -180..+180 degrees
//-------------------------------------------------------------
rev180 : function( x ){
  return ( x - 360.0 * Math.floor( x * this.INV360 + 0.5 ) );
},


//-------------------------------------------------------------
// This function computes GMST0, the Greenwhich Mean Sidereal
// Time at 0h UT (i.e. the sidereal time at the Greenwhich
// meridian at 0h UT).
// GMST is then the sidereal time at Greenwich at any time of
// the day.  GMST0 is generalized as well, and is defined as:
//
//  GMST0 = GMST - UT
//
// This allows GMST0 to be computed at other times than 0h UT
// as well.  While this sounds somewhat contradictory, it is
// very practical:
// Instead of computing GMST like:
//
//  GMST = (GMST0) + UT * (366.2422/365.2422)
//
// where (GMST0) is the GMST last time UT was 0 hours, one simply
// computes:
//
//  GMST = GMST0 + UT
//
// where GMST0 is the GMST "at 0h UT" but at the current moment!
// Defined in this way, GMST0 will increase with about 4 min a
// day.  It also happens that GMST0 (in degrees, 1 hr = 15 degr)
// is equal to the Sun's mean longitude plus/minus 180 degrees!
// (if we neglect aberration, which amounts to 20 seconds of arc
// or 1.33 seconds of time)
//-------------------------------------------------------------
GMST0 : function( dayDiff ) {
  var const1 = 180.0 + 356.0470 + 282.9404;

//  var const2 = 0.9856002585 + 4.70935E-5;

  var const2 = 0.9856002585 + 4.70935/100000;  // for Opera


  return this.revolution( const1 + const2 * dayDiff );
      
}, //=================== GMST0() =========================


/* * * * * * * *    SUNRISET SCRIPT - END -  * * * * * * * * */



formValues: function(lat, lon, _date, tzOffset, tf)
{
  var year = _date.getFullYear();

  var month = _date.getMonth()+1;

  var day = _date.getDate();

  this.sunRiseSet(year,month,day,lat,lon);

  this.civTwilight(year,month,day,lat,lon);

  tzOffset = tzOffset / 60.0;

  var twst_h = Math.floor(this.twStartT - tzOffset)
  var twst_m = Math.floor((this.twStartT - tzOffset - twst_h)*60)

  var sris_h = Math.floor(this.sRiseT - tzOffset )
  var sris_m = Math.floor((this.sRiseT - tzOffset - sris_h)*60)

  var sset_h = Math.floor(this.sSetT - tzOffset )
  var sset_m = Math.floor((this.sSetT - tzOffset - sset_h)*60)

  var twen_h = Math.floor(this.twEndT - tzOffset )
  var twen_m = Math.floor((this.twEndT - tzOffset - twen_h)*60)

  var twStart;
  var twEnd;
  var srise;
  var sset;
  
  if(this.twStatus == 0){
    twStart = this.formatTime(twst_h, twst_m, tf);     
    twEnd = this.formatTime(twen_h, twen_m, tf);
  } else if(this.twStatus > 0 && this.srStatus <= 0)  {
    twStart = "all";
    twEnd = "no";
  } else {
    twStart = "no";
    twEnd = "all";
  }

  if(this.srStatus == 0) {
    srise = this.formatTime(sris_h, sris_m, tf);     
    sset = this.formatTime(sset_h, sset_m, tf);
  } else {
    srise = "na";     
    sset = "na";
  }

  return new Array(twStart, twEnd, srise, sset);
},

formatTime: function(h, m, tf) {
  if (h > 23) h -= 24;
  if (h < 0) h += 24;
  
  var minutes = (m < 10 ? "0" : "") + m;
  
  if (tf == "ampm") {
    var hour;
    var mer;
    if (h > 11) {
      mer = "PM";
      h-=12;
    } else {
      mer = "AM";
    }

    if (h == 0) h = 12;
    
    return h + ":" + minutes + mer;
  } else {
    return (h < 10 ? "0" : "") + h + ":" + minutes;
  }
}

};
