
let requiredBefore = false;
let server = null;
let runner = null;
let windowModule = null;

let send = function(topic, data) {
  if(windowModule && windowModule.readyToSend()) {
    windowModule.getMainWindow().webContents.send(topic, data);
  }
};

let startListen = function(server) {
  server.on("synMessage", function(data) {
    server.addSymmetricKey(data.symmetricKey);
    send("synMessage", data);
  });

  server.on("dataMessage", function(payload) {
    payload.data = payload.data.toString()
    console.log("newMsg: ", payload);
    send("dataMessage", payload);
  });
}

module.exports = function(ipcMain, dialog, _windowModule) {
  windowModule = _windowModule;
  p5 = require('p5-node');
  let server = null;

  ipcMain.on("SendSynMessage", function(evt, publicKey, channel) {
    if(server) {
      console.log("sendInitialKey: ", publicKey);
      let opts = {};
      if(channel) opts.channel = channel;

      let newSymmetricKey = server.sendSynMsg(publicKey, new Buffer(''), opts);
      send("SynMessageSent", {key:newSymmetricKey});
    }
  });

  ipcMain.on("SendDataMessage", function(evt, key, message) {
    console.log("sendMessage: ", key, " ", message);
    if(server) {
      server.sendDataMsg(key, new Buffer(message));
    }
  });

  //Adding a contact
  ipcMain.on("AddSymmetricKey", function(evt, key) {
    if(server) {
      console.log("Adding Symmetric Key ", key, " to the db");
      server.addSymmetricKey(key);
    }
  });

  ipcMain.on("JoinNetwork", function(evt, params) {
    if(!server) {
      console.log("Joining Network...");
      p5.join(params.nodeAddress, params.nodePort, params.minNodes, params.maxNodes, params.opts).then(p5server => {
        server = p5server;
        send("Network Joined", {key:server.key, channel:server.channel});
        console.log("Network Joined");
        server.start();
        startListen(server);
      }).catch(err => {
        console.log("Could not create server...");
        console.log(err);
      });
    }
  });

  ipcMain.on("CreateNetwork", function(evt, params) {
    if(!server){
      console.log("Creating Network...");
      p5.create([params.server], params.opts).then(p5server => {
        server = p5server;
        send("Network Created", {key:server.key, channel:server.channel});
        console.log("Network Created");
        server.start();
        startListen(server);
      }).catch(err => {
        console.log("Could not create server...");
        console.log(err);
      });
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
