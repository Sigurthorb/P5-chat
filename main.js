const {app, Menu, Tray, dialog, ipcMain, BrowserWindow} = require('electron');


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

function ExitFromTray() {
  // TODO: exit service correctly
  // TODO: close window
  windowModule.close();
  app.quit();
}

let windowModule = require("./electronComponents/window.js")(BrowserWindow);
let eventModule = require("./electronComponents/events.js")(ipcMain, dialog, windowModule);
let trayModule = require("./electronComponents/tray.js")(Tray, Menu, windowModule, ExitFromTray);

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', trayModule.createTray)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
