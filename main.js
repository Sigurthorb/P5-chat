const {app, Menu, Tray, dialog, ipcMain, ipcRenderer, BrowserWindow} = require('electron');

/*
if(require('electron-squirrel-startup')) return;

let handleStartupEvent = function() {
  if(process.playform !== 'win32') {
    return false;
  }

  let squirrelCommand = process.argv[1];

  switch (squirrelCommand) {
    case '--squirrel-install':
    case '--squirrel-updated':

      // Optionally do things such as:
      //
      // - Install desktop and start menu shortcuts
      // - Add your .exe to the PATH
      // - Write to the registry for things like file associations and
      //   explorer context menus

      // Always quit when done
      app.quit();

      return true;
    case '--squirrel-uninstall':
      // Undo anything you did in the --squirrel-install and
      // --squirrel-updated handlers

      // Always quit when done
      app.quit();

      return true;
    case '--squirrel-obsolete':
      // This is called on the outgoing version of your app before
      // we update to the new version - it's the opposite of
      // --squirrel-updated
      app.quit();
      return true;
  }
}

if (handleStartupEvent()) {
  return;
}
*/
function ExitFromTray() {
  console.log('Stop Everything!');
  let server = eventModule.getServer()
  if(server) {
    server.stop().then(() => {
      windowModule.close();
      app.quit();
    });
  }
}

let windowModule = require("./electronComponents/window.js")(BrowserWindow);
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
    ExitFromTray();
  }
});

//On OS X, show or create a mainWindow when the user clicks the dock icon
app.on('activate', windowModule.show);
