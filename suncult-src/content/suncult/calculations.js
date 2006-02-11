var suncultUtils = {
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

var suncultCalcSun = {
// Global variables:

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
  return 367 * y - Math.floor( (7 * (y + Math.floor((m + 9)/12)))/4)+
          Math.floor((275*m)/9) + d - 730530;
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
sunRiseSet : function(year,month,day,lat,lon, srAngle){
  return this.sunTimes( year, month, day, lat, lon, srAngle, 1);
},



//-------------------------------------------------------------
// This function computes the start and end times of civil
// twilight. Civil twilight starts/ends when the Sun's center
// is 6 degrees below the horizon.
//-------------------------------------------------------------
civTwilight : function(year,month,day,lat,lon, twAngle){
  return this.sunTimes( year, month, day, lat, lon, twAngle, 0);
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
//  dump(dayDiff + "\n");

      /* Compute local sideral time of this moment */

  var gmts = this.GMST0(dayDiff);
//  dump(gmts + "\n");
  locSidT = this.revolution( gmts + 180.0 + lon);
//  dump(locSidT + "\n");

      /* Compute Sun's RA + Decl at this moment */

  this.sunRaDec( dayDiff );

      /* Compute time when Sun is at south - in hours UT */
      

  sSouthT = 12.0 - this.rev180(locSidT - this.sRA)/15.0;
//  dump(sSouthT + "\n");


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

  x = this.sDIST * this.cosd(this.sLON);

  y = this.sDIST * this.sind(this.sLON);

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

  this.sLON = v + w;                      // True solar longitude

  if ( this.sLON >= 360.0 )
    this.sLON -= 360.0;                   // Make it 0..360 degrees

}, //=================== sunPos() =============================



//-------------------------------------------------------------
// Reduce angle to within 0..360 degrees
//-------------------------------------------------------------
revolution : function( x ){
  return (x - 360.0 * Math.floor( x / 360.0 ));
},


//-------------------------------------------------------------
// Reduce angle to within -180..+180 degrees
//-------------------------------------------------------------
rev180 : function( x ){
  return ( x - 360.0 * Math.floor( 0.5 + x / 360.0  ) );
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

  var const2 = 0.9856002585 + 4.70935/100000.0;  // for Opera

  var result = this.revolution( const1 + const2 * dayDiff );
//  dump(result + "\n");
  return result;
      
}, //=================== GMST0() =========================


/* * * * * * * *    SUNRISET SCRIPT - END -  * * * * * * * * */



formValues: function(lat, lon, _date, tzOffset, tf, srAngle, twAngle)
{
  var year = _date.getFullYear();

  var month = _date.getMonth()+1;

  var day = _date.getDate();

//  dump("y: " + year + "\n");
//  dump("m: " + month + "\n");
//  dump("d: " + day + "\n");

  this.sunRiseSet(year,month,day,lat,lon, srAngle);

  this.civTwilight(year,month,day,lat,lon, twAngle);

  tzOffset = tzOffset / 60.0;

//  dump("ts: " + this.twStartT + "\n");
//  dump("sr: " + this.sRiseT + "\n");
//  dump("ss: " + this.sSetT + "\n");
//  dump("te: " + this.twEndT + "\n");
  
  var twst_h = Math.floor(this.twStartT - tzOffset);
  var twst_m = Math.floor((this.twStartT - tzOffset - twst_h)*60);

  var sris_h = Math.floor(this.sRiseT - tzOffset );
  var sris_m = Math.floor((this.sRiseT - tzOffset - sris_h)*60);

  var sset_h = Math.floor(this.sSetT - tzOffset );
  var sset_m = Math.floor((this.sSetT - tzOffset - sset_h)*60);

  var twen_h = Math.floor(this.twEndT - tzOffset );
  var twen_m = Math.floor((this.twEndT - tzOffset - twen_h)*60);

  var twStart;
  var twEnd;
  var srise;
  var sset;
  
  if(this.twStatus == 0){
    twStart = suncultUtils.formatTime(twst_h, twst_m, tf);     
    twEnd = suncultUtils.formatTime(twen_h, twen_m, tf);
  } else if(this.twStatus > 0 && this.srStatus <= 0)  {
    twStart = "all";
    twEnd = "no";
  } else {
    twStart = "no";
    twEnd = "all";
  }

  if(this.srStatus == 0) {
    srise = suncultUtils.formatTime(sris_h, sris_m, tf);     
    sset = suncultUtils.formatTime(sset_h, sset_m, tf);
  } else {
    srise = "na";     
    sset = "na";
  }

  return [ twStart, twEnd, srise, sset ];
}


};

var suncultCalcMoon = {

DR: Math.PI / 180,
K1: 15 * Math.PI / 180 * 1.0027379,

Moonrise: false,
Moonset: false,

Rise_time: [0, 0],
Set_time: [0, 0],
Rise_az: 0.0,
Set_az: 0.0,

RAn: [0.0, 0.0, 0.0],
Dec: [0.0, 0.0, 0.0],
VHz: [0.0, 0.0, 0.0],

synodic: 29.53058867,

phasePercent: function(theDate) {
  var msPerDay = 24 * 60 * 60 * 1000;
  var baseDate = new Date();
    baseDate.setUTCFullYear(2005);
    baseDate.setUTCMonth(4);
    baseDate.setUTCDate(8);
    baseDate.setUTCHours(8);
    baseDate.setUTCMinutes(48);
    
  var diff = theDate - baseDate;
  var phase = diff / (this.synodic * msPerDay);
  phase *= 10000;
  return (Math.floor(phase) % 10000) / 100.0;
},

age: function(theDate) {
  return this.phasePercent(theDate) * this.synodic / 100.0;
},

daysToFullMoon: function(theDate) {
  var age = this.age(theDate);
  var r = this.synodic / 2 - age;
  return r > 0 ? r : this.synodic + r;  
},

phaseName: function(theDate) {
  var age = this.age(theDate);
//  dump("age: " + age + "\n");
  if (age < 1.84566)
    return "new";
  else if (age < 5.53699)
    return "waxing.crescent";
  else if (age < 9.22831)
    return "first.quarter";
  else if (age < 12.91963)
    return "waxing.gibbous";
  else if (age < 16.61096)
    return "full";
  else if (age < 20.30228)
    return "waning.gibbous";
  else if (age < 23.99361)
    return "last.quarter";
  else if (age < 27.68493)
    return "waning.crescent";
  else
    return "new";
},

// calculate moonrise and moonset times
riseset: function( lat, lon, now, zone, tf) {
    var i, j, k;
    var jd = this.julian_day(now) - 2451545;           // Julian day relative to Jan 1.5, 2000
    
    var mp = new Array(3);                     // create a 3x3 array
    for (i = 0; i < 3; i++) {
        mp[i] = new Array(3);
        for (j = 0; j < 3; j++)
            mp[i][j] = 0.0;
    }
  
    lon = lon/360;
    zone = zone / 60;
    var tz = zone/24;
    var t0 = this.lst(lon, jd, tz);                 // local sidereal time

    jd = jd + tz;                              // get moon position at start of day

    for (k = 0; k < 3; k++) {
//        dump("jd: " + jd + "\n");
        var sky = this.moon(jd);
        mp[k][0] = sky[0];
        mp[k][1] = sky[1];
        mp[k][2] = sky[2];
        jd = jd + 0.5;      
    }   

    if (mp[1][0] <= mp[0][0])
        mp[1][0] = mp[1][0] + 2*Math.PI;

    if (mp[2][0] <= mp[1][0])
        mp[2][0] = mp[2][0] + 2*Math.PI;

    this.RAn[0] = mp[0][0];
    this.Dec[0] = mp[0][1];

    this.Moonrise = false;                          // initialize
    this.Moonset  = false;
    
    for (k = 0; k < 24; k++)                   // check each hour of this day
    {
        ph = (k + 1)/24;
        
        this.RAn[2] = this.interpolate(mp[0][0], mp[1][0], mp[2][0], ph);
        this.Dec[2] = this.interpolate(mp[0][1], mp[1][1], mp[2][1], ph);
        
        this.VHz[2] = this.test_moon(k, zone, t0, lat, mp[1][2]);

        this.RAn[0] = this.RAn[2];                       // advance to next hour
        this.Dec[0] = this.Dec[2];
        this.VHz[0] = this.VHz[2];
    }

//    dump( this.Rise_time[0] + ":" + this.Rise_time[1] + " " +
//          this.Set_time[0] + ":" + this.Set_time[1] + "\n");

    // display results
    return [ this.Moonrise ? suncultUtils.formatTime(this.Rise_time[0],this.Rise_time[1], tf) : null,
             this.Moonset ? suncultUtils.formatTime(this.Set_time[0],this.Set_time[1], tf) : null,
             Math.floor(this.Rise_az),
             Math.floor(this.Set_az) ];
             
},

// Local Sidereal Time for zone
lst: function( lon, jd, z ) {
  var s = 24110.5 + 8640184.812999999*jd/36525 + 86636.6*z + 86400*lon;
  s = s/86400;
  s = s - Math.floor(s);
  return s*360*this.DR;
},

// 3-point interpolation
interpolate: function( f0, f1, f2, p ) {
    var a = f1 - f0;
    var b = f2 - f1 - a;
    var f = f0 + p*(2*a + b*(2*p - 1));

    return f;
},

// test an hour for an event
test_moon : function ( k, zone, t0, lat, plx )
{
//  dump( k + "," + zone+ "," + t0+ "," + lat+ "," + plx + "\n");
  var ha = [0.0, 0.0, 0.0];
  var a, b, c, d, e, s, z;
  var hr, min, time;
  var az, hz, nz, dz;

  if (this.RAn[2] < this.RAn[0])
      this.RAn[2] = this.RAn[2] + 2*Math.PI;
      
//  dump(this.RAn.toString() + "\n");      
  
  ha[0] = t0 - this.RAn[0] + k*this.K1;
  ha[2] = t0 - this.RAn[2] + k*this.K1 + this.K1;
  
  ha[1]  = (ha[2] + ha[0])/2;                // hour angle at half hour
  this.Dec[1] = (this.Dec[2] + this.Dec[0])/2;              // declination at half hour

  s = Math.sin(this.DR*lat);
  c = Math.cos(this.DR*lat);

  // refraction + sun semidiameter at horizon + parallax correction
  z = Math.cos(this.DR*(90.567 - 41.685/plx));

  if (k <= 0)                                // first call of function
      this.VHz[0] = s*Math.sin(this.Dec[0]) + c*Math.cos(this.Dec[0])*Math.cos(ha[0]) - z;

  this.VHz[2] = s*Math.sin(this.Dec[2]) + c*Math.cos(this.Dec[2])*Math.cos(ha[2]) - z;
  
//  dump ("vhz: " + this.VHz[0] + " " + this.VHz[2] + "\n");
  
  if (this.sgn(this.VHz[0]) == this.sgn(this.VHz[2]))
      return this.VHz[2];                         // no event this hour
  
  this.VHz[1] = s*Math.sin(this.Dec[1]) + c*Math.cos(this.Dec[1])*Math.cos(ha[1]) - z;

  a = 2*this.VHz[2] - 4*this.VHz[1] + 2*this.VHz[0];
  b = 4*this.VHz[1] - 3*this.VHz[0] - this.VHz[2];
  d = b*b - 4*a*this.VHz[0];

  if (d < 0)
      return this.VHz[2];                         // no event this hour
  
  d = Math.sqrt(d);
  e = (-b + d)/(2*a);

  if (( e > 1 )||( e < 0 ))
      e = (-b - d)/(2*a);

  time = k + e + 1/120;                      // time of an event + round up
  hr   = Math.floor(time);
  min  = Math.floor((time - hr)*60);

  hz = ha[0] + e*(ha[2] - ha[0]);            // azimuth of the moon at the event
  nz = -Math.cos(this.Dec[1])*Math.sin(hz);
  dz = c*Math.sin(this.Dec[1]) - s*Math.cos(this.Dec[1])*Math.cos(hz);
  az = Math.atan2(nz, dz)/this.DR;
  if (az < 0) az = az + 360;
  
  if ((this.VHz[0] < 0)&&(this.VHz[2] > 0))
  {
      this.Rise_time[0] = hr;
      this.Rise_time[1] = min;
      this.Rise_az = az;
      this.Moonrise = true;
  }
  
  if ((this.VHz[0] > 0)&&(this.VHz[2] < 0))
  {
      this.Set_time[0] = hr;
      this.Set_time[1] = min;
      this.Set_az = az;
      this.Moonset = true;
  }

  return this.VHz[2];
},

// test an hour for an event
test_sun : function ( k, zone, t0, lat )
{
  var ha = new Array(3);
  var a, b, c, d, e, s, z;
  var hr, min, time;
  var az, dz, hz, nz;
  
  ha[0] = t0 - this.RAn[0] + k*this.K1; 
  ha[2] = t0 - this.RAn[2] + k*this.K1 + this.K1; 

  ha[1]  = (ha[2]  + ha[0])/2;               // hour angle at half hour
  this.Dec[1] = (this.Dec[2] + this.Dec[0])/2 ;             // declination at half hour
  
  s = Math.sin(lat*this.DR);
  c = Math.cos(lat*this.DR);
  z = Math.cos(90.833*this.DR);                   // refraction + sun semidiameter at horizon

  if (k <= 0)
      this.VHz[0] = s*Math.sin(this.Dec[0]) + c*Math.cos(this.Dec[0])*Math.cos(ha[0]) - z;

  this.VHz[2] = s*Math.sin(this.Dec[2]) + c*Math.cos(this.Dec[2])*Math.cos(ha[2]) - z;
  
  if (this.sgn(this.VHz[0]) == this.sgn(this.VHz[2])) 
      return this.VHz[2];                         // no event this hour
  
  this.VHz[1] = s*Math.sin(this.Dec[1]) + c*Math.cos(this.Dec[1])*Math.cos(ha[1]) - z;
  
  a =  2* VHz[0] - 4*VHz[1] + 2*VHz[2]; 
  b = -3* VHz[0] + 4*VHz[1] - VHz[2];   
  d = b*b - 4*a*VHz[0];

  if (d < 0) 
      return this.VHz[2];                         // no event this hour
  
  d = Math.sqrt(d);    
  e = (-b + d)/(2 * a);
  
  if ((e > 1)||(e < 0))
      e = (-b - d)/(2*a);

  time = k + e + 1/120;                      // time of an event
  
  hr = Math.floor(time);
  min = Math.floor((time - hr)*60);

  hz = ha[0] + e*(ha[2] - ha[0]);            // azimuth of the sun at the event
  nz = -Math.cos(Dec[1])*Math.sin(hz);
  dz = c*Math.sin(Dec[1]) - s*Math.cos(Dec[1])*Math.cos(hz);
  az = Math.atan2(nz, dz)/DR;
  if (az < 0) az = az + 360;
  
  if ((this.VHz[0] < 0)&&(this.VHz[2] > 0))
  {
      this.Rise_time[0] = hr;
      this.Rise_time[1] = min;
      this.Rise_az = az;
      this.Moonrise = true;
  }
  
  if ((this.VHz[0] > 0)&&(this.VHz[2] < 0))
  {
      this.Set_time[0] = hr;
      this.Set_time[1] = min;
      this.Set_az = az;
      this.Moonset = true;
  }

  return this.VHz[2];
},


// moon's position using fundamental arguments 
// (Van Flandern & Pulkkinen, 1979)
moon : function ( jd ) {
    var d, f, g, h, m, n, s, u, v, w;

    h = 0.606434 + 0.03660110129*jd;
    m = 0.374897 + 0.03629164709*jd;
    f = 0.259091 + 0.0367481952 *jd;
    d = 0.827362 + 0.03386319198*jd;
    n = 0.347343 - 0.00014709391*jd;
    g = 0.993126 + 0.0027377785 *jd;

    h = h - Math.floor(h);
    m = m - Math.floor(m);
    f = f - Math.floor(f);
    d = d - Math.floor(d);
    n = n - Math.floor(n);
    g = g - Math.floor(g);

    h = h*2*Math.PI;
    m = m*2*Math.PI;
    f = f*2*Math.PI;
    d = d*2*Math.PI;
    n = n*2*Math.PI;
    g = g*2*Math.PI;

    v = 0.39558*Math.sin(f + n);
    v = v + 0.082  *Math.sin(f);
    v = v + 0.03257*Math.sin(m - f - n);
    v = v + 0.01092*Math.sin(m + f + n);
    v = v + 0.00666*Math.sin(m - f);
    v = v - 0.00644*Math.sin(m + f - 2*d + n);
    v = v - 0.00331*Math.sin(f - 2*d + n);
    v = v - 0.00304*Math.sin(f - 2*d);
    v = v - 0.0024 *Math.sin(m - f - 2*d - n);
    v = v + 0.00226*Math.sin(m + f);
    v = v - 0.00108*Math.sin(m + f - 2*d);
    v = v - 0.00079*Math.sin(f - n);
    v = v + 0.00078*Math.sin(f + 2*d + n);
    
    u = 1 - 0.10828*Math.cos(m);
    u = u - 0.0188 *Math.cos(m - 2*d);
    u = u - 0.01479*Math.cos(2*d);
    u = u + 0.00181*Math.cos(2*m - 2*d);
    u = u - 0.00147*Math.cos(2*m);
    u = u - 0.00105*Math.cos(2*d - g);
    u = u - 0.00075*Math.cos(m - 2*d + g);
    
    w = 0.10478*Math.sin(m);
    w = w - 0.04105*Math.sin(2*f + 2*n);
    w = w - 0.0213 *Math.sin(m - 2*d);
    w = w - 0.01779*Math.sin(2*f + n);
    w = w + 0.01774*Math.sin(n);
    w = w + 0.00987*Math.sin(2*d);
    w = w - 0.00338*Math.sin(m - 2*f - 2*n);
    w = w - 0.00309*Math.sin(g);
    w = w - 0.0019 *Math.sin(2*f);
    w = w - 0.00144*Math.sin(m + n);
    w = w - 0.00144*Math.sin(m - 2*f - n);
    w = w - 0.00113*Math.sin(m + 2*f + 2*n);
    w = w - 0.00094*Math.sin(m - 2*d + g);
    w = w - 0.00092*Math.sin(2*m - 2*d);

    s = w/Math.sqrt(u - v*v);                  // compute moon's right ascension ...  
    var result = new Array(3);
    result[0] = h + Math.atan(s/Math.sqrt(1 - s*s));

    s = v/Math.sqrt(u);                        // declination ...
    result[1] = Math.atan(s/Math.sqrt(1 - s*s));

    result[2] = 60.40974*Math.sqrt( u );        // and parallax
    return result;
},

// determine Julian day from calendar date
// (Jean Meeus, "Astronomical Algorithms", Willmann-Bell, 1991)
julian_day: function (now) {
    var a, b, jd;
    var gregorian;

    var month = now.getMonth() + 1;
    var day   = now.getDate();
    var year  = now.getFullYear();

    gregorian = (year < 1583) ? false : true;
    
    if ((month == 1)||(month == 2)) {
        year  = year  - 1;
        month = month + 12;
    }

    a = Math.floor(year/100);
    if (gregorian) b = 2 - a + Math.floor(a/4);
    else           b = 0.0;

    jd = Math.floor(365.25*(year + 4716)) 
       + Math.floor(30.6001*(month + 1)) 
       + day + b - 1524.5;
    
    return jd;
},

// returns value for sign of argument
sgn : function( x ) {
    var rv;
    if (x > 0.0)      rv =  1;
    else if (x < 0.0) rv = -1;
    else              rv =  0;
    return rv;
}

}  
