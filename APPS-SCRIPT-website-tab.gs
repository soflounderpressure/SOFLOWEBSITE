/*  SoFlo CRM — add a "Website" tab for website submissions
 *  ---------------------------------------------------------
 *  What this does: the website (instant quote + contact form) now sends
 *  type:"weblead". This routes those into their own "Website" tab, separate
 *  from your field/estimator "Leads" and the "Knocks" tab.
 *
 *  HOW TO INSTALL (one time, ~2 min):
 *  1. Open your Sheet → Extensions → Apps Script.
 *  2. In doPost(), right AFTER the line that parses the body
 *     (the one like:  var data = JSON.parse(e.postData.contents);  — the
 *     variable may be named something else, e.g. d or body), paste this ONE line:
 *
 *         if (data.type === 'weblead') return logWeb_(data);
 *
 *     (use your own variable name instead of `data` if different).
 *     Put it ABOVE your existing photo / knock / leads routing.
 *  3. Paste the whole logWeb_ function below at the bottom of the file.
 *  4. Save. Then Deploy → Manage deployments → (pencil/Edit your web app) →
 *     Version: New version → Deploy. This keeps the SAME /exec URL.
 *  5. Done. Submit a test quote on the site; a "Website" tab appears with the row.
 *
 *  Note: no other changes needed. Your Leads/Knocks/Photos keep working.
 *
 *  UPDATE (zone pricing + attribution columns): logWeb_ now writes area, zone,
 *  zip, promo, UTM, gclid, referrer, landing, device, prefDate, plan2, plan4.
 *  The owner must redeploy for these to take effect: Deploy → Manage deployments →
 *  (pencil/Edit your web app) → Version: New version → Deploy. Same /exec URL.
 *  On an existing Website tab, type the new column names into row 1 after "id",
 *  in the same order, so the headers line up with the data.
 */

function logWeb_(data){
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var name = 'Website';
  var cols = ['created','source','name','phone','email','address','ptype',
              'surfaces','size','condition','twostory',
              'estimate','estLow','estHigh','status','notes','id',
              'area','zone','zip','promo','utm_source','utm_medium','utm_campaign',
              'gclid','referrer','landing','device','prefDate','plan2','plan4'];
  var sh = ss.getSheetByName(name);
  if (!sh){
    sh = ss.insertSheet(name);
    sh.appendRow(cols);
    sh.getRange(1,1,1,cols.length).setFontWeight('bold').setBackground('#182B3F').setFontColor('#ffffff');
    sh.setFrozenRows(1);
    sh.autoResizeColumns(1, cols.length);
  }
  var row = cols.map(function(c){ return (data[c] !== undefined && data[c] !== null) ? data[c] : ''; });

  // upsert by id (so a resend updates the same row instead of duplicating)
  var idCol = cols.indexOf('id') + 1;
  var last  = sh.getLastRow();
  if (last >= 2){
    var ids = sh.getRange(2, idCol, last-1, 1).getValues();
    for (var r = 0; r < ids.length; r++){
      if (String(ids[r][0]) === String(data.id)){
        sh.getRange(r+2, 1, 1, cols.length).setValues([row]);
        return ContentService.createTextOutput(JSON.stringify({ok:true, updated:true}))
               .setMimeType(ContentService.MimeType.JSON);
      }
    }
  }
  sh.appendRow(row);
  return ContentService.createTextOutput(JSON.stringify({ok:true, added:true}))
         .setMimeType(ContentService.MimeType.JSON);
}
