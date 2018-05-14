let mainWindow = null;
let sendReady = false;
let BrowserWindow = null;

let isQuitting = false;

const path = require('path')
const url = require('url')
const startUrl = process.env.ELECTRON_START_URL || url.format({ pathname: path.join(__dirname, '/../build/index.html'), protocol: 'file:', slashes: true })

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
  //clear localStorage
  mainWindow.webContents.executeJavaScript('localStorage.clear()');
  isQuitting = true;
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

module.exports = function(_BrowserWindow) {
  BrowserWindow = _BrowserWindow;

  return {
    createWindow: createWindow,
    show: show,
    hide: hide,
    close: close,
    readyToSend: readyToSend,
    getMainWindow: getMainWindow
  };
}