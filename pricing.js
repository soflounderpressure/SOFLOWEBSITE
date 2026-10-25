/*
 * SoFlo UnderPressure pricing. THIS FILE IS THE SINGLE SOURCE OF TRUTH FOR PRICES.
 * Change prices, zones, ZIPs and the promo here only. Load synchronously (no defer)
 * before any inline script that uses window.SF.
 */
(function(){
var SF={
 P:{driveway:119,walkway:89,patio:149,fence:109,house:279,roof:349,screen:139},
 SIZES:[['Small',1],['Medium',1.5],['Large',2.1],['X-large',2.8]],
 CONDS:[['Light',1],['Moderate',1.25],['Heavy',1.55]],
 SIZEW:{driveway:1,walkway:0.4,patio:1,fence:0.5,house:1,roof:1,screen:1},
 BUNDLE:0.6, MIN:109, MREG:1.25, STAINS:50,
 TWO:{house:1.3,roof:1.15}, TILE:1.3, PLAN:{plan2:0.85,plan4:0.75},
 ZONES:{
  A:[1.00,'our standard Miami rate'],
  B:[1.05,'our near-Miami rate, +5%'],
  C:[1.10,'our Broward rate, +10%'],
  D:[1.15,'our premium-area rate, +15%'],
  E:[1.25,'our barrier-island rate, +25%']
 },
 ZONEWORD:{A:'standard Miami',B:'near-Miami',C:'Broward',D:'premium-area',E:'barrier-island'},
 /* slug:[zone,'Display Name',county] */
 CITY:{
   'hialeah':['A','Hialeah','Miami-Dade'],
   'miami-lakes':['A','Miami Lakes','Miami-Dade'],
   'doral':['A','Doral','Miami-Dade'],
   'medley':['A','Medley','Miami-Dade'],
   'kendall':['A','Kendall','Miami-Dade'],
   'south-miami':['A','South Miami','Miami-Dade'],
   'north-miami':['A','North Miami','Miami-Dade'],
   'cutler-bay':['A','Cutler Bay','Miami-Dade'],
   'homestead':['A','Homestead','Miami-Dade'],
   'florida-city':['A','Florida City','Miami-Dade'],
   'miami-shores':['B','Miami Shores','Miami-Dade'],
   'north-miami-beach':['B','North Miami Beach','Miami-Dade'],
   'hallandale-beach':['B','Hallandale Beach','Broward'],
   'dania-beach':['B','Dania Beach','Broward'],
   'hollywood':['B','Hollywood','Broward'],
   'pembroke-pines':['C','Pembroke Pines','Broward'],
   'miramar':['C','Miramar','Broward'],
   'davie':['C','Davie','Broward'],
   'coral-gables':['D','Coral Gables','Miami-Dade'],
   'coconut-grove':['D','Coconut Grove','Miami-Dade'],
   'pinecrest':['D','Pinecrest','Miami-Dade'],
   'aventura':['D','Aventura','Miami-Dade'],
   'weston':['D','Weston','Broward'],
   'fort-lauderdale':['D','Fort Lauderdale','Broward'],
   'miami-beach':['E','Miami Beach','Miami-Dade'],
   'bal-harbour':['E','Bal Harbour','Miami-Dade'],
   'surfside':['E','Surfside','Miami-Dade']
 },
 /* exact 5-digit ZIP -> zone (later zone wins on duplicates: A,B,C,D,E) */
 ZIP:{
   '33004':'B','33009':'B','33010':'A','33011':'A','33012':'A','33013':'A','33014':'A','33015':'A',
   '33016':'A','33017':'A','33018':'A','33019':'B','33020':'B','33021':'B','33023':'C','33024':'C',
   '33025':'C','33026':'C','33027':'C','33028':'C','33029':'C','33030':'A','33031':'A','33032':'A',
   '33033':'A','33034':'A','33035':'A','33122':'A','33133':'D','33134':'D','33138':'B','33139':'E',
   '33140':'E','33141':'E','33143':'A','33146':'D','33150':'B','33153':'B','33154':'E','33155':'A',
   '33156':'D','33157':'A','33160':'B','33161':'A','33162':'B','33165':'A','33166':'A','33167':'A',
   '33168':'A','33169':'A','33170':'A','33171':'A','33172':'A','33173':'A','33174':'A','33175':'A',
   '33176':'A','33177':'A','33178':'A','33179':'A','33180':'D','33181':'A','33182':'A','33183':'A',
   '33184':'A','33185':'A','33186':'A','33187':'A','33188':'A','33189':'A','33190':'A','33191':'A',
   '33192':'A','33193':'A','33194':'A','33195':'A','33196':'A','33301':'D','33302':'D','33303':'D',
   '33304':'D','33305':'D','33306':'D','33307':'D','33308':'D','33309':'D','33310':'D','33311':'D',
   '33312':'D','33313':'D','33314':'C','33315':'D','33316':'D','33324':'C','33325':'C','33326':'D',
   '33327':'D','33328':'C','33330':'C','33331':'D','33332':'D'
 },
 ZIPPREFIX:{'331':'A','330':'B','333':'C'},
 PROMO:{code:'RESET25',label:'Fall Algae Reset',amount:25,min:150,ends:'2026-12-15T23:59:59-05:00',endsText:'Dec 15'},
 /* conversion hooks. Empty string = feature hidden. */
 BOOKING_URL:'',        /* Google Calendar appointment schedule "Open booking page" link */
 REVIEW_URL:'https://g.page/r/CRFhNckvcNFZEBM/review',         /* Google review link (g.page/r/... or search.google.com/local/writereview?placeid=...). Empty = /review.html falls back to a thank-you + text-us page. */
 GOOGLE_CLIENT_ID:'',   /* OAuth Web client ID, ends in .apps.googleusercontent.com */
 zoneFor:function(slugOrZip){
  var k=String(slugOrZip==null?'':slugOrZip).replace(/^\s+|\s+$/g,'').toLowerCase();
  if(this.CITY.hasOwnProperty(k))return this.CITY[k][0];
  if(/^\d{5}$/.test(k)){
   if(this.ZIP.hasOwnProperty(k))return this.ZIP[k];
   var pre=k.slice(0,3);
   if(this.ZIPPREFIX.hasOwnProperty(pre))return this.ZIPPREFIX[pre];
  }
  return 'A';
 },
 zonePrices:function(z){
  var m=(this.ZONES[z]||this.ZONES.A)[0],o={},id;
  for(id in this.P){if(this.P.hasOwnProperty(id))o[id]=Math.round(this.P[id]*m);}
  return o;
 },
 promoActive:function(){return Date.now()<Date.parse(this.PROMO.ends);},
 cityName:function(slug){
  var k=String(slug==null?'':slug).toLowerCase();
  return this.CITY.hasOwnProperty(k)?this.CITY[k][1]:'';
 },
 zoneInfo:function(slugOrZip){
  var z=this.zoneFor(slugOrZip),zn=this.ZONES[z];
  return {zone:z,mult:zn[0],reason:zn[1],word:this.ZONEWORD[z]};
 }
};
window.SF=SF;
})();
