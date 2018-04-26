
let requiredBefore = false;

let runner = null;
let windowModule = null;

let send = function(topic, data) {
  if(windowModule && windowModule.readyToSend()) {
    windowModule.getMainWindow().webContents.send(topic, data);
  }
};

let startListen = function(server) {
  server.on("...", function(data) {
    send("...", data);
  });
}

module.exports = function(ipcMain, dialog, _windowModule) {
  windowModule = _windowModule;
  //p5 = require("P5-node");
  let server = null;

  ipcMain.on("SendSynMessage", function(obj, publickey, symmetrickey, channel) {
    if(server) {
      server.sendsyn();
    }
  });

  ipcMain.on("SendDataMessage", function(buffer, symmetricKey, channel) {
    if(server) {
      server.sendData();
    }
  });

  ipcMain.on("JoinNetwork", function(obj) {
    if(!server) {
      server = p5.join();
    }
  });

  ipcMain.on("CreateNetwork", function(obj) {
    if(!server){
      server = p5.create();
    }
  });

  ipcMain.on("LeaveNetwork", function() {
    if(server) {
      server.leave();
      server = null;
    }
  });

 

  return {on: ipcMain.on, send: send};
}