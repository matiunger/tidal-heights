var ss = SpreadsheetApp.getActiveSpreadsheet();
var sheet = ss.getSheetByName("alturas");
var sheetlogs = ss.getSheetByName("fail_logs");

function checkMin () {
  var min = new Date().getMinutes();
  var isChecktime = min == 5 || min == 22 || min == 24 || min == 26 || min == 35; // Retries in case fetch fails
  if (!isChecktime) { Logger.log("incorrect minute"); return; } 
  
  // run time
  var currentHour = new Date().getHours();
  var prevHour = currentHour == 0 ? 23 : currentHour-1;
  
  // sheet time (last saved data)
  var lastDataHour = parseInt(sheet.getRange(3,3).getDisplayValue().split(":")[0]);
  
  var isOkHour = lastDataHour != prevHour // Avoid repeating when running retry minutes (24 and 26) after succesfull fetch
  if (!isOkHour) { Logger.log("incorrect hour"); return; } 
  
  // web data at run time
  var webHour = parseInt(fetchData()[2].split(":")[0])
  
  var isNewHour = lastDataHour != webHour // Avoid repeating when web does not have a new hour data point
  if (!isNewHour) { Logger.log("repeating hour data point"); insertData(fetchData(), sheetlogs); return; }
  
  if (isChecktime && isOkHour && isNewHour) {
    insertData(fetchData(), sheet)
  }
}

function fetchData() {
    var url = "http://www.hidro.gov.ar/oceanografia/alturashorarias.asp";
  
    var pageTxt = UrlFetchApp.fetch(url).getContentText();
    var lasthour = pageTxt.substr(pageTxt.indexOf("<th>Mareógrafo</th>"),970).split("<th>")[2]
    //Logger.log(lasthour)
    var date = lasthour.split("<br/>")[0].trim()
    //Logger.log(date)
    var hour = lasthour.split("<br/>")[1].replace("</th>","").trim()
    //Logger.log(hour)
    var datetime = new Date(date.split("/")[2],date.split("/")[1]-1,date.split("/")[0],hour.split(":")[0],hour.split(":")[1]);
    
    var altsanfer = pageTxt.substr(pageTxt.indexOf("Fernando</span>"),1350).split("<td>")[1].replace("</td>","").trim(); // San Fernando
    var altsanfer2 = pageTxt.substr(pageTxt.indexOf("Aires</span>"),1350).split("<td>")[1].replace("</td>","").trim(); // Buenos Aires
    
    var datenow = new Date();
    //Logger.log(altsanfer);
  
    return [datenow,
            date,
            hour,
            datetime,
            altsanfer,
            altsanfer2
           ];
  
}

function insertData(array, sheet) {
    
  sheet.insertRows(3, 1);//shift all rows down by one from row 3
  sheet.getRange(3,1,1,6)//(start row, start column, number of rows, number of columns
   .setValues([array]);
  
}
