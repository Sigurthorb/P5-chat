
requiredBefore = false;

let Tray = null;
let windowModule = null;

const path = require('path')
let config = require("./config.js");

function createTray() {
  windowModule.createWindow(true); // can decide if we want to show window or not when app is opened
  tray = new Tray(config["icon-path"]);

  const contextMenu = Menu.buildFromTemplate([
    { label: 'Open App', type: 'normal', click: windowModule.show },
    { label: "Exit", type: "normal", click: ExitFromTray }
  ]);

  tray.setToolTip('Backend process for P5 chat')
  tray.setContextMenu(contextMenu)

  tray.on("double-click", windowModule.show);
}

module.exports = function (_Tray, _Menu, _windowModule, _ExitFromTray) {
  Tray = _Tray;
  Menu = _Menu;
  windowModule = _windowModule;
  ExitFromTray = _ExitFromTray;

  return {createTray: createTray};
}