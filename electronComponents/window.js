let mainWindow = null;
let sendReady = false;
let BrowserWindow = null;

let isQuitting = false;

const path = require('path')
const url = require('url')

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
    frame: true,
    show: showWindow,
    icon: config["icon-path"],
    webPreferences: {
    nodeIntegration: true,
    preload: path.join(__dirname, "preload.js")
  }});

  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, "..", '/dist/index.html'),
    protocol: 'file:',
    slashes: true
  }));

  // development tool window
  // mainWindow.webContents.openDevTools()

  mainWindow.on('close', function (event) {
    if(!isQuitting) {
      event.preventDefault();
      mainWindow.hide();
    }
  });

  mainWindow.webContents.on("did-finish-load", function() {
    sendReady = true;
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

function close() {
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