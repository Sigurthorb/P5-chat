let mainWindow = null;
let sendReady = false;
let BrowserWindow = null;

let isQuitting = false;

const path = require('path')
const url = require('url')
const startUrl = process.env.ELECTRON_START_URL || url.format({ pathname: path.join(__dirname, '/../build/index.html'), protocol: 'file:', slashes: true })
const { Menu, MenuItem } = require('electron')
const menu = new Menu();

let config = require("./config.js");

requiredBefore = false;

function emmitEvent(topic, data) {
  if(mainWindow) {
    mainWindow.webContents.send(topic, data);
  }
}

function createWindow (showWindow) {
  isQuitting = false;
  mainWindow = new BrowserWindow({
    resizable: false,
    width: 900,
    height: 600,
    show: showWindow,
    icon: config["icon-path"],
    webPreferences: {
    nodeIntegration: true,
    preload: path.join(__dirname, "preload.js")
  }});

  //Development tool window
  if(process.env.ELECTRON_START_URL) mainWindow.webContents.openDevTools()
  mainWindow.loadURL(startUrl);

    // Create the Application's main menu
    let template = [{
      label: "Application",
      submenu: [
          { label: "About Application", selector: "orderFrontStandardAboutPanel:" },
          { type: "separator" },
          { label: "Quit", accelerator: "Command+Q", click: ExitFromTray }
      ]}, {
      label: "Edit",
      submenu: [
          { label: "Undo", accelerator: "CmdOrCtrl+Z", selector: "undo:" },
          { label: "Redo", accelerator: "Shift+CmdOrCtrl+Z", selector: "redo:" },
          { type: "separator" },
          { label: "Cut", accelerator: "CmdOrCtrl+X", selector: "cut:" },
          { label: "Copy", accelerator: "CmdOrCtrl+C", selector: "copy:" },
          { label: "Paste", accelerator: "CmdOrCtrl+V", selector: "paste:" },
          { label: "Select All", accelerator: "CmdOrCtrl+A", selector: "selectAll:" }
    ]}];

    Menu.setApplicationMenu(Menu.buildFromTemplate(template));

  //This is called when the main window is closing
  mainWindow.on('close', function (event) {
    if(!isQuitting) {
      event.preventDefault();
      mainWindow.hide();
    }
  });

  mainWindow.webContents.on("did-finish-load", function() {
    sendReady = true;
  });

  mainWindow.webContents.on('new-window', function(event, url){
    event.preventDefault();
    require('electron').shell.openExternal(url);
  });
}

function show() {
  if(!mainWindow) {
    createWindow(true);
  } else {
    if(!mainWindow.isVisible()) {
      mainWindow.show();
    }
  }
}

//This is called when the app is quitting
function close() {
  console.log('Clearing storage....');
  return new Promise((resolve, reject) => {
    //clear localStorage
    mainWindow.webContents.executeJavaScript('localStorage.removeItem("appUser")');
    //mainWindow.webContents.executeJavaScript('localStorage.clear()');
    isQuitting = true;
    resolve();
  });
}

function hide() {
  if(mainWindow && mainWindow.isVisible()) {
    mainWindow.hide();
  }
}

function readyToSend() {
  return sendReady && mainWindow;
}

function getMainWindow() {
  return mainWindow;
}

module.exports = function(_BrowserWindow, _ExitFromTray) {
  BrowserWindow = _BrowserWindow;
  ExitFromTray = _ExitFromTray

  return {
    createWindow: createWindow,
    show: show,
    hide: hide,
    close: close,
    readyToSend: readyToSend,
    getMainWindow: getMainWindow
  };
}