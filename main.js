// Modules to control application life and create native browser window.
const {app, BrowserWindow, ipcMain} = require('electron')
const path = require('path')
const {machineIdSync} = require('node-machine-id')
const WhopApi = require('whopapi')

var whop = new WhopApi.Whop({clientID: "<your clientID>"});

// Here, we are maintaining some installation specific variables in memory.
// You should persist these values to a storage layer of your choice (ex. a SQL DB). 
var licenseKey = null;
var hwid = null;
var userHash = null;

function createWindow () {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })

  // Load the index.html of the app.
  mainWindow.loadFile('index.html')
}

// Interprocess comunication to handle user inputting their license key.
ipcMain.handle('initialize', async ( event, data ) => {
  // Call Whop API to validate license key.
  try {
    var resp = await whop.validateLicenseByKey(data.licenseKey, {});
    // If valid, load application.
    if (resp.valid) {
      licenseKey = data.licenseKey;
      hwid = machineIdSync();
      userHash = Math.floor(Math.random() * 1000)

      // Update metadata for this installation.
      let _ = await whop.updateLicenseByKey(licenseKey, {
        "hwid": hwid,
        "userHash": userHash
      })

      BrowserWindow.getFocusedWindow().loadFile("app.html");
    } else {
      // If invalid, display error.
      BrowserWindow.getFocusedWindow().webContents.send("initialize", {
        error: "Invalid license key!"
      })
    }
  } catch {
    // If invalid, display error.
    BrowserWindow.getFocusedWindow().webContents.send("initialize", {
      error: "Invalid license key!"
    })
  }
})

// This channel should be sent a message (aka triggered) periodically
// to make sure the user still has a valid license.
ipcMain.handle('validate', async (event, data) => {
  // Call Whop API to validate license key.
  try {
    var resp = await whop.validateLicenseByKey(licenseKey, {
      "hwid": machineIdSync(),
      "userHash": userHash,
    });
  } catch {
    BrowserWindow.getFocusedWindow().loadFile("index.html");
    BrowserWindow.getFocusedWindow().webContents.send("initialize", {
      error: "License key is no longer valid!"
    })
  }
})

ipcMain.handle('profile', async (event, data) => {
  var metadata = {}  
  // Replace relevant metadata.
  // Metadata can be used to store user session or hardware information (like a hwid or userHash)
  // or user preference information.
  metadata["bananaType"] = data.bananaType;

  // Call Whop API to set user metadata.
  // Note: this call will not clobber metadata keys that are not passed in.
  var _ = await whop.updateLicenseByKey(licenseKey, metadata)
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
