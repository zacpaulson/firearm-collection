# ⚜ Firearm Collection Registry

A personal firearm collection tracker that runs entirely in your browser. Your data lives in **your own private Google Sheet** — nobody else can see it. The app is free to use and requires no account, no subscription, and no server beyond Google's free tier.

---

## Features

- **Firearms** — full CRUD with make, model, serial, caliber, condition, purchase/sell records, photos, and notes
- **NFA Items** — suppressor and SBR tracking with Form 4/Form 1 approval dates, trust info, and tax stamp records
- **Ammunition** — inventory tracking by caliber with cost-per-round and round count
- **Accessories** — gear tracking with assignment to specific firearms
- **Reloading** — equipment, dies, powder, primers, bullets, and brass inventory
- **Load Recipes** — saved reloading recipes with charge weights and velocities
- **Range Log** — session logging with round counts and notes
- **Maintenance** — service records per firearm
- **Notes** — freeform notes with priority levels
- **Dashboard** — net worth summary, pie charts, acquisition timeline, caliber cross-reference
- **PDF Exports** — full collection, insurance report, NFA registry, sold firearms report
- **Google Drive Backup** — one-tap JSON backup to your Drive
- **Offline Mode** — works without internet using locally cached data
- **4 Visual Themes** — Elegant, Tactical, Daylight, Industrial
- **PWA Support** — installable as a home screen app on Android and desktop

---

## Quick Start

1. **[Open the app](https://zacpaulson.github.io/firearm-collection)**
2. Follow the first-time setup wizard to connect your Google Sheet backend
3. Create a password and start adding your collection

The setup wizard walks you through everything. Total setup time is about 5–10 minutes.

---

## Backend Setup (One Time)

Your data is stored in a Google Sheet that you own and control. Follow these steps to set it up.

### Step 1 — Create a Google Sheet

1. Go to [sheets.google.com](https://sheets.google.com) and create a new blank spreadsheet
2. Name it something like **Firearm Collection**
3. Leave it open — you'll need the spreadsheet ID in a moment

### Step 2 — Create a Google Apps Script Project

1. Go to [script.google.com](https://script.google.com)
2. Click **New Project**
3. Name it **Firearm Collection API** (or anything you like)
4. Delete all the placeholder code in the editor
5. Paste the entire contents of **[Code.gs](Code.gs)** from this repository
6. Click **Save** (the floppy disk icon)

### Step 3 — Connect the Script to Your Sheet

1. In the Apps Script editor, click **Project Settings** (the gear icon on the left)
2. Under **Google Sheets API**, click **Change project**  
   — Or use this method: in your Google Sheet, go to **Extensions → Apps Script** and paste the Code.gs there instead. This automatically links them.

> **Recommended method:** Open your Google Sheet → Extensions → Apps Script → paste Code.gs → save. This automatically links the script to your sheet and creates the required tabs on first use.

### Step 4 — Deploy as a Web App

1. In the Apps Script editor, click **Deploy → New Deployment**
2. Click the gear icon next to "Type" and select **Web app**
3. Fill in the settings:
   - **Description:** Firearm Collection API
   - **Execute as:** Me
   - **Who has access:** Anyone
4. Click **Deploy**
5. **Copy the Web App URL** — it looks like:  
   `https://script.google.com/macros/s/LONG_STRING_HERE/exec`

### Step 5 — Connect the App

1. Open the app and paste your Web App URL into the setup wizard
2. Click **Connect & Get Started**
3. Create a password when prompted
4. Start adding your collection

---

## Redeploying After Updates

If you ever edit `Code.gs` (for example, after pulling an update from this repo), you **must redeploy** for the changes to take effect:

1. Apps Script editor → **Deploy → Manage Deployments**
2. Click the pencil (edit) icon on your existing deployment
3. Change the version to **New version**
4. Click **Deploy**

Simply saving `Code.gs` is not enough — a new deployment is required.

---

## Google Sheet Structure

The app automatically creates all required tabs on first use. You don't need to create them manually. For reference, here's what gets created:

| Tab | Columns |
|-----|---------|
| `Collection` | ID, Make, Model, Serial, Caliber, Condition, PurchasePrice, CurrentValue, Notes, Images, Nickname, Type, PurchasedFrom, PurchaseDate, PurchaseLocation, PurchaseNotes, Sold, SoldTo, SellDate, SellLocation, SellPrice, SellNotes |
| `NFA` | ID, Nickname, NfaType, Manufacturer, SerialNumber, Caliber, TaxStamp, PurchasePrice, CurrentValue, FormType, ApprovalDate, RegistrationType, TrustName, Notes, Images, Docs, Model, PurchasedFrom, PurchaseDate, PurchaseLocation, PurchaseNotes |
| `Accessories` | ID, Nickname, AccType, Quantity, PurchasePrice, CurrentValue, Notes, Images, AssignedTo |
| `Ammo` | ID, Manufacturer, Caliber, AmmoType, Weight, Rounds, CostPerRound, Notes |
| `Auth` | (hidden — stores your hashed password) |
| `RL_equipment` | ID, Data |
| `RL_dies` | ID, Data |
| `RL_powder` | ID, Data |
| `RL_primers` | ID, Data |
| `RL_bullets` | ID, Data |
| `RL_brass` | ID, Data |

---

## Security

- Your data never touches any server other than Google's infrastructure
- Passwords are hashed with SHA-256 + salt before storage — your raw password is never saved anywhere
- The Apps Script URL alone gives no access without the correct password
- Range log, maintenance records, load recipes, and notes are stored in your browser's `localStorage` only — they never leave your device
- The app source code is public (MIT license) but your Google Sheet is private to your Google account

---

## Installing as an App (PWA)

**Android (Chrome or Samsung Internet):**
1. Open the app in your browser
2. Tap the **⬇ Install App** button that appears in the bottom-right corner
   — Or tap the browser menu → **Add to Home Screen**
3. The app installs with its own icon and opens fullscreen

**Desktop (Chrome or Edge):**
1. Look for the install icon in the address bar (a monitor with a down arrow)
2. Click it and confirm
3. The app opens in its own window without browser chrome

**iPhone (Safari):**
1. Tap the Share button → **Add to Home Screen**
2. The app opens fullscreen from your home screen

---

## Updating the App

When a new version is released:

1. Download the new `index.html` from this repository
2. Go to your GitHub repo → click `index.html` → click the pencil (edit) icon → or just upload the new file
3. Commit the change
4. GitHub Pages deploys automatically within ~1 minute
5. Everyone gets the update on their next page refresh

Your data in Google Sheets is unaffected by app updates.

---

## Troubleshooting

**Blank screen on load**  
Open browser DevTools (F12 → Console) and check for error messages. Most commonly caused by a missing or incorrect Apps Script URL. Open the app → ⚙ Settings → re-enter your URL.

**"Unauthorized" errors**  
Your password doesn't match. If you've forgotten your password, open your Google Sheet → Auth tab → clear cell A1 → the app will prompt you to create a new password.

**Date fields showing incorrectly**  
Google Sheets sometimes auto-converts date strings into Date objects. If you notice dates displaying wrong, open the Apps Script editor and run the `fixAllDates()` function once (Run → Run function → fixAllDates).

**Changes not saving**  
Make sure your Apps Script deployment is set to **"Anyone"** under who has access. If you recently edited Code.gs, remember to redeploy with a new version.

**App not installing as PWA**  
PWA installation requires the app to be served over HTTPS. It works when accessed via the GitHub Pages URL. It will not install when opened directly from a local file.

---

## Architecture

```
Browser (index.html)
    │
    ├── UI / Logic / Styles — single HTML file, no build step
    ├── localStorage — range log, maintenance, recipes, notes, offline cache
    │
    └── Google Apps Script (Code.gs)
            │
            └── Google Sheets — your private data store
```

- **Frontend:** Single `index.html` file — all UI, logic, and styles included
- **Backend:** Google Apps Script web app (free, no server required)
- **Database:** Google Sheets (your private spreadsheet)
- **Hosting:** GitHub Pages (free static hosting)

---

## License

MIT License — free to use, modify, and share. See [LICENSE](LICENSE) for details.
