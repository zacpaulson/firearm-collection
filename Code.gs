const SHEET_NAME = "Collection";
const PASSWORD_SHEET = "Auth";
const AMMO_SHEET = "Ammo";

function doGet(e) {
  return handleRequest(e);
}

function doPost(e) {
  return handleRequest(e);
}

function handleRequest(e) {
  var action = e.parameter.action;
  var output = ContentService.createTextOutput();
  output.setMimeType(ContentService.MimeType.JSON);

  try {
    var result = {};

    if (action === "checkPassword") {
      result = checkPassword(e.parameter.password);
    } else if (action === "setPassword") {
      result = setPassword(e.parameter.password);
    } else if (action === "clearPassword") {
      result = clearPassword(e.parameter.password);
    } else if (action === "getGuns") {
      result = getGuns(e.parameter.password);
    } else if (action === "saveGun") {
      result = saveGun(e.parameter.password, JSON.parse(e.parameter.gun));
    } else if (action === "deleteGun") {
      result = deleteGun(e.parameter.password, e.parameter.id);
    } else if (action === "getAmmo") {
      result = getAmmo(e.parameter.password);
    } else if (action === "saveAmmo") {
      result = saveAmmo(e.parameter.password, JSON.parse(e.parameter.ammo));
    } else if (action === "deleteAmmo") {
      result = deleteAmmo(e.parameter.password, e.parameter.id);
    } else if (action === "getAcc") {
      result = getAcc(e.parameter.password);
    } else if (action === "saveAcc") {
      result = saveAcc(e.parameter.password, JSON.parse(e.parameter.acc));
    } else if (action === "deleteAcc") {
      result = deleteAcc(e.parameter.password, e.parameter.id);
    } else if (action === "getNfa") {
      result = getNfa(e.parameter.password);
    } else if (action === "saveNfa") {
      result = saveNfa(e.parameter.password, JSON.parse(e.parameter.nfa));
    } else if (action === "deleteNfa") {
      result = deleteNfa(e.parameter.password, e.parameter.id);
    } else if (action === "getRl") {
      result = getRl(e.parameter.password);
    } else if (action === "saveRl") {
      result = saveRl(e.parameter.password, e.parameter.sub, JSON.parse(e.parameter.item));
    } else if (action === "deleteRl") {
      result = deleteRl(e.parameter.password, e.parameter.sub, e.parameter.id);
    } else if (action === "backupToDrive") {
      result = backupToDrive(e.parameter.password, e.parameter.data);
    } else {
      result = { error: "Unknown action" };
    }

    output.setContent(JSON.stringify(result));
  } catch (err) {
    output.setContent(JSON.stringify({ error: err.toString() }));
  }

  return output;
}

function getAuthSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(PASSWORD_SHEET);
  if (!sheet) {
    sheet = ss.insertSheet(PASSWORD_SHEET);
    sheet.hideSheet();
  }
  return sheet;
}

function checkPassword(password) {
  var sheet = getAuthSheet();
  var stored = sheet.getRange("A1").getValue();
  if (!stored) return { status: "no_password" };
  if (stored === hashString(password)) return { status: "ok" };
  return { status: "wrong" };
}

function clearPassword(password) {
  var sheet = getAuthSheet();
  var stored = sheet.getRange("A1").getValue();
  if (!stored || stored !== hashString(password)) return { error: "Unauthorized" };
  sheet.getRange("A1").clearContent();
  return { status: "ok" };
}

function setPassword(password) {
  var sheet = getAuthSheet();
  var stored = sheet.getRange("A1").getValue();
  if (stored) return { error: "Password already set" };
  sheet.getRange("A1").setValue(hashString(password));
  return { status: "ok" };
}

function hashString(str) {
  var bytes = Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256,
    str + "::fc_salt_2024"
  );
  return bytes.map(function(b) {
    return ("0" + (b & 0xFF).toString(16)).slice(-2);
  }).join("");
}

function verifyPassword(password) {
  var sheet = getAuthSheet();
  var stored = sheet.getRange("A1").getValue();
  return stored && stored === hashString(password);
}

function getCollectionSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.getRange(1, 1, 1, 20).setValues([[
      "ID","Make","Model","Serial","Caliber","Condition","PurchasePrice","CurrentValue","Notes","Images",
      "Nickname","Type","PurchasedFrom","PurchaseDate","PurchaseLocation","PurchaseNotes",
      "Sold","SoldTo","SellDate","SellLocation","SellPrice","SellNotes"
    ]]);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function getGuns(password) {
  if (!verifyPassword(password)) return { error: "Unauthorized" };
  var sheet = getCollectionSheet();
  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return { guns: [] };
  var guns = data.slice(1).map(function(row) {
    return {
      id: row[0], make: row[1], model: row[2], serial: row[3],
      caliber: row[4], condition: row[5], purchasePrice: row[6],
      currentValue: row[7], notes: row[8],
      images: row[9] ? JSON.parse(row[9]) : [],
      nickname: row[10], type: row[11],
      purchasedFrom: row[12], purchaseDate: row[13],
      purchaseLocation: row[14], purchaseNotes: row[15],
      sold: row[16]==='true'||row[16]===true,
      soldTo: row[17], sellDate: row[18],
      sellLocation: row[19], sellPrice: row[20], sellNotes: row[21]
    };
  });
  return { guns: guns };
}

function saveGun(password, gun) {
  if (!verifyPassword(password)) return { error: "Unauthorized" };
  var sheet = getCollectionSheet();
  var data = sheet.getDataRange().getValues();
  var row = [
    gun.id, gun.make, gun.model, gun.serial, gun.caliber,
    gun.condition, gun.purchasePrice, gun.currentValue,
    gun.notes, JSON.stringify(gun.images || []),
    gun.nickname||'', gun.type||'',
    gun.purchasedFrom||'', gun.purchaseDate||'',
    gun.purchaseLocation||'', gun.purchaseNotes||'',
    gun.sold?'true':'false',
    gun.soldTo||'', gun.sellDate||'',
    gun.sellLocation||'', gun.sellPrice||'', gun.sellNotes||''
  ];
  var targetRow = -1;
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(gun.id)) {
      sheet.getRange(i + 1, 1, 1, 22).setValues([row]);
      targetRow = i + 1;
      break;
    }
  }
  if (targetRow === -1) {
    sheet.appendRow(row);
    targetRow = sheet.getLastRow();
  }
  // Force date columns to plain text so Sheets never auto-converts YYYY-MM-DD into Date objects
  // PurchaseDate = column 14, SellDate = column 19
  sheet.getRange(targetRow, 14).setNumberFormat('@');
  sheet.getRange(targetRow, 19).setNumberFormat('@');
  return { status: "saved" };
}

function deleteGun(password, id) {
  if (!verifyPassword(password)) return { error: "Unauthorized" };
  var sheet = getCollectionSheet();
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(id)) {
      sheet.deleteRow(i + 1);
      return { status: "deleted" };
    }
  }
  return { error: "Not found" };
}

function getAccSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("Accessories");
  if (!sheet) {
    sheet = ss.insertSheet("Accessories");
    sheet.getRange(1, 1, 1, 9).setValues([[
      "ID", "Nickname", "AccType", "Quantity", "PurchasePrice", "CurrentValue", "Notes", "Images", "AssignedTo"
    ]]);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function getAcc(password) {
  if (!verifyPassword(password)) return { error: "Unauthorized" };
  var sheet = getAccSheet();
  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return { acc: [] };
  var acc = data.slice(1).map(function(row) {
    return {
      id: row[0], nickname: row[1], accType: row[2],
      quantity: row[3], purchasePrice: row[4], currentValue: row[5],
      notes: row[6], images: row[7] ? JSON.parse(row[7]) : [],
      assignedTo: row[8] ? String(row[8]) : ''
    };
  });
  return { acc: acc };
}

function saveAcc(password, entry) {
  if (!verifyPassword(password)) return { error: "Unauthorized" };
  var sheet = getAccSheet();
  var data = sheet.getDataRange().getValues();
  var row = [entry.id, entry.nickname, entry.accType, entry.quantity,
    entry.purchasePrice, entry.currentValue, entry.notes,
    JSON.stringify(entry.images || []), entry.assignedTo || ''];
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(entry.id)) {
      sheet.getRange(i + 1, 1, 1, 9).setValues([row]);
      return { status: "updated" };
    }
  }
  sheet.appendRow(row);
  return { status: "added" };
}

function deleteAcc(password, id) {
  if (!verifyPassword(password)) return { error: "Unauthorized" };
  var sheet = getAccSheet();
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(id)) {
      sheet.deleteRow(i + 1);
      return { status: "deleted" };
    }
  }
  return { error: "Not found" };
}

function getAmmoSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(AMMO_SHEET);
  if (!sheet) {
    sheet = ss.insertSheet(AMMO_SHEET);
    sheet.getRange(1, 1, 1, 8).setValues([[
      "ID", "Manufacturer", "Caliber", "AmmoType",
      "Weight", "Rounds", "CostPerRound", "Notes"
    ]]);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function getAmmo(password) {
  if (!verifyPassword(password)) return { error: "Unauthorized" };
  var sheet = getAmmoSheet();
  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return { ammo: [] };
  var ammo = data.slice(1).map(function(row) {
    return {
      id: row[0], manufacturer: row[1], caliber: row[2],
      ammoType: row[3], weight: row[4], rounds: row[5],
      costPerRound: row[6], notes: row[7]
    };
  });
  return { ammo: ammo };
}

function saveAmmo(password, entry) {
  if (!verifyPassword(password)) return { error: "Unauthorized" };
  var sheet = getAmmoSheet();
  var data = sheet.getDataRange().getValues();
  var row = [
    entry.id, entry.manufacturer, entry.caliber, entry.ammoType,
    entry.weight, entry.rounds, entry.costPerRound, entry.notes
  ];
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(entry.id)) {
      sheet.getRange(i + 1, 1, 1, 8).setValues([row]);
      return { status: "updated" };
    }
  }
  sheet.appendRow(row);
  return { status: "added" };
}

function deleteAmmo(password, id) {
  if (!verifyPassword(password)) return { error: "Unauthorized" };
  var sheet = getAmmoSheet();
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(id)) {
      sheet.deleteRow(i + 1);
      return { status: "deleted" };
    }
  }
  return { error: "Not found" };
}

function getNfaSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("NFA");
  if (!sheet) {
    sheet = ss.insertSheet("NFA");
    sheet.getRange(1,1,1,21).setValues([[
      "ID","Nickname","NfaType","Manufacturer","SerialNumber","Caliber",
      "TaxStamp","PurchasePrice","CurrentValue","FormType","ApprovalDate",
      "RegistrationType","TrustName","Notes","Images","Docs",
      "Model","PurchasedFrom","PurchaseDate","PurchaseLocation","PurchaseNotes"
    ]]);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function getNfa(password) {
  if (!verifyPassword(password)) return { error: "Unauthorized" };
  var sheet = getNfaSheet();
  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return { nfa: [] };
  var nfa = data.slice(1).map(function(row) {
    return {
      id: row[0], nickname: row[1], nfaType: row[2], manufacturer: row[3],
      serialNumber: row[4], caliber: row[5], taxStamp: row[6],
      purchasePrice: row[7], currentValue: row[8], formType: row[9],
      approvalDate: row[10], registrationType: row[11], trustName: row[12],
      notes: row[13],
      images: row[14] ? JSON.parse(row[14]) : [],
      docs: row[15] ? JSON.parse(row[15]) : [],
      model: row[16] ? String(row[16]) : '',
      purchasedFrom: row[17] ? String(row[17]) : '',
      purchaseDate: row[18] ? String(row[18]) : '',
      purchaseLocation: row[19] ? String(row[19]) : '',
      purchaseNotes: row[20] ? String(row[20]) : ''
    };
  });
  return { nfa: nfa };
}

function saveNfa(password, entry) {
  if (!verifyPassword(password)) return { error: "Unauthorized" };
  var sheet = getNfaSheet();
  var data = sheet.getDataRange().getValues();
  var row = [
    entry.id, entry.nickname, entry.nfaType, entry.manufacturer,
    entry.serialNumber, entry.caliber, entry.taxStamp,
    entry.purchasePrice, entry.currentValue, entry.formType,
    entry.approvalDate, entry.registrationType, entry.trustName,
    entry.notes, JSON.stringify(entry.images||[]), JSON.stringify(entry.docs||[]),
    entry.model||'', entry.purchasedFrom||'', entry.purchaseDate||'',
    entry.purchaseLocation||'', entry.purchaseNotes||''
  ];
  var targetRow = -1;
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(entry.id)) {
      sheet.getRange(i+1,1,1,21).setValues([row]);
      targetRow = i + 1;
      break;
    }
  }
  if (targetRow === -1) {
    sheet.appendRow(row);
    targetRow = sheet.getLastRow();
  }
  // Force date column (PurchaseDate = col 19) to plain text
  sheet.getRange(targetRow, 19).setNumberFormat('@');
  return { status: "saved" };
}

function deleteNfa(password, id) {
  if (!verifyPassword(password)) return { error: "Unauthorized" };
  var sheet = getNfaSheet();
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(id)) {
      sheet.deleteRow(i+1);
      return { status: "deleted" };
    }
  }
  return { error: "Not found" };
}

// RELOADING
var RL_SUBS = ['equipment','dies','powder','primers','bullets','brass'];

function getRlSheet(sub) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var name = 'RL_' + sub;
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    sheet.getRange(1,1,1,2).setValues([["ID","Data"]]);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function getRl(password) {
  if (!verifyPassword(password)) return { error: "Unauthorized" };
  var result = {};
  RL_SUBS.forEach(function(sub) {
    var sheet = getRlSheet(sub);
    var data = sheet.getDataRange().getValues();
    result[sub] = data.length <= 1 ? [] : data.slice(1).map(function(row) {
      try { return JSON.parse(row[1]); } catch(e) { return null; }
    }).filter(Boolean);
  });
  return { rl: result };
}

function saveRl(password, sub, item) {
  if (!verifyPassword(password)) return { error: "Unauthorized" };
  var sheet = getRlSheet(sub);
  var data = sheet.getDataRange().getValues();
  var row = [item.id, JSON.stringify(item)];
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(item.id)) {
      sheet.getRange(i+1,1,1,2).setValues([row]);
      return { status: "updated" };
    }
  }
  sheet.appendRow(row);
  return { status: "added" };
}

function deleteRl(password, sub, id) {
  if (!verifyPassword(password)) return { error: "Unauthorized" };
  var sheet = getRlSheet(sub);
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(id)) {
      sheet.deleteRow(i+1);
      return { status: "deleted" };
    }
  }
  return { error: "Not found" };
}

// BACKUP TO GOOGLE DRIVE
function backupToDrive(password, data) {
  if (!verifyPassword(password)) return { error: "Unauthorized" };
  try {
    var folder;
    var folderName = "Paulson Arsenal Backups";
    var folders = DriveApp.getFoldersByName(folderName);
    if (folders.hasNext()) {
      folder = folders.next();
    } else {
      folder = DriveApp.createFolder(folderName);
    }
    var date = new Date();
    var timestamp = Utilities.formatDate(date, Session.getScriptTimeZone(), "yyyy-MM-dd_HH-mm");
    var fileName = "arsenal_backup_" + timestamp + ".json";
    folder.createFile(fileName, data, MimeType.PLAIN_TEXT);
    // Keep only the last 10 backups
    var files = folder.getFilesByName;
    var allFiles = [];
    var iter = folder.getFiles();
    while (iter.hasNext()) { allFiles.push(iter.next()); }
    allFiles.sort(function(a,b){ return b.getDateCreated()-a.getDateCreated(); });
    if (allFiles.length > 10) {
      for (var i = 10; i < allFiles.length; i++) { allFiles[i].setTrashed(true); }
    }
    return { status: "ok", file: fileName };
  } catch(e) {
    return { error: e.toString() };
  }
}

// ── ONE-TIME DATE FIX ─────────────────────────────────────────────────────────
// Run this ONCE from the Apps Script editor (Run > fixAllDates) to convert any
// auto-formatted date cells in the Collection sheet back to plain YYYY-MM-DD strings.
// Safe to run multiple times — it skips cells that are already correct or empty.
function fixAllDates() {
  var sheet = getCollectionSheet();
  var data = sheet.getDataRange().getValues();
  var tz = Session.getScriptTimeZone();
  var fixed = 0;
  var skipped = 0;

  // PurchaseDate = column 14 (index 13), SellDate = column 19 (index 18)
  var dateCols = [
    { colIndex: 13, colNum: 14, label: 'PurchaseDate' },
    { colIndex: 18, colNum: 19, label: 'SellDate'     }
  ];

  for (var i = 1; i < data.length; i++) {
    dateCols.forEach(function(col) {
      var raw = data[i][col.colIndex];
      if (raw === '' || raw === null || raw === undefined) { skipped++; return; }

      var formatted = '';

      if (raw instanceof Date) {
        // Sheets returned a real Date object — format it in the spreadsheet's timezone
        formatted = Utilities.formatDate(raw, tz, 'yyyy-MM-dd');
      } else {
        var s = String(raw).trim();
        if (!s) { skipped++; return; }

        // Already correct YYYY-MM-DD — just force the cell format, no rewrite needed
        if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
          sheet.getRange(i + 1, col.colNum).setNumberFormat('@');
          skipped++;
          return;
        }

        // M/D/YYYY or MM/DD/YYYY locale format
        var mdy = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
        if (mdy) {
          formatted = mdy[3] + '-' + mdy[1].padStart(2, '0') + '-' + mdy[2].padStart(2, '0');
        } else {
          // Try parsing as a generic date
          var d = new Date(s);
          if (!isNaN(d.getTime())) {
            formatted = Utilities.formatDate(d, tz, 'yyyy-MM-dd');
          } else {
            skipped++;
            return;
          }
        }
      }

      if (formatted) {
        var cell = sheet.getRange(i + 1, col.colNum);
        cell.setValue(formatted);
        cell.setNumberFormat('@');
        fixed++;
      }
    });
  }

  var msg = 'fixAllDates complete.\nFixed: ' + fixed + ' cells\nSkipped/already OK: ' + skipped + ' cells';
  Logger.log(msg);
  SpreadsheetApp.getUi().alert(msg);
}
