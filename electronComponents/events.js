
let requiredBefore = false;
let server = null;
let runner = null;
let windowModule = null;

let send = function(topic, data) {
  if(windowModule && windowModule.readyToSend()) {
    windowModule.getMainWindow().webContents.send(topic, data);
  }
};

let startListen = function(srv) {
  srv.on("synMessage", function(data) {
    send("synMessage", data);
  });

  srv.on("dataMessage", function(payload) {
    payload.data = payload.data.toString()
    console.log("newMsg: ", payload);
    send("dataMessage", payload);
  });

  srv.on("parentLeft", function() {
    console.log('Parent Left. Set Server to null');
    server = null;
    console.log(server);
    send("parentLeft");
  });
}

module.exports = function(ipcMain, dialog, _windowModule) {
  windowModule = _windowModule;
  p5 = require('p5-node');

  ipcMain.on("SendSynMessage", function(evt, publicKey, channel) {
    if(server) {
      console.log("sendInitialKey: ", publicKey);
      let opts = {};
      if(channel) opts.channel = channel;

      let newSymmetricKey = server.sendSynMsg(publicKey, new Buffer(''), opts);
      if(newSymmetricKey) {
        send("SynMessageSent", {key:newSymmetricKey});
      }

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
        server.start().then((myIp) => {
          send("Network Joined", {key:server.key, channel:server.channel, ip:myIp, topologyServer:server.getTopologyServer()});
          console.log("Network Joined");
        });
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
        server.start().then((myIp) => {
          send("Network Created", {key:server.key, channel:server.channel, ip:myIp});
          console.log("Network Created");
        });
        startListen(server);
      }).catch(err => {
        console.log("Could not create server...");
        console.log(err);
      });
    }
  });

  function getServer() {
    return server;
  } 

  return {on: ipcMain.on, send: send, getServer: getServer};
}
