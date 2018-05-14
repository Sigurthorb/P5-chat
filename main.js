const { app, Menu, Tray, dialog, ipcMain, ipcRenderer, BrowserWindow } = require('electron');
let QuittingApp = false;

console.log(process.versions);

function ExitFromTray() {
  if(!QuittingApp) {
    QuittingApp = true;
    let server = eventModule.getServer();

    if(server) {
      server.stop().then(() => {
        windowModule.close().then(app.quit);
      });
    } else {
      windowModule.close().then(app.quit);
    }   
  } 
}

let windowModule = require("./electronComponents/window.js")(BrowserWindow, ExitFromTray);
let eventModule = require("./electronComponents/events.js")(ipcMain, dialog, windowModule);
let trayModule = require("./electronComponents/tray.js")(Tray, Menu, windowModule, ExitFromTray);

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
  if (process.platform !== 'darwin') { 
    trayModule.createTray();
    //No need for a Tray on Mac. We'll just use the dock icon ;)
  } else {
    windowModule.createWindow(true); // can decide if we want to show window or not when app is opened
  }
})

app.on('before-quit', function () { 
  // On OS X, quit the app when the user quits explicitly with Cmd + Q
  if (process.platform === 'darwin') {

      console.log('Stop Everything!');
    ExitFromTray();
  }
});

//On OS X, show or create a mainWindow when the user clicks the dock icon
app.on('activate', windowModule.show);
