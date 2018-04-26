

//receive message
event.on("SynMessage", function(obj) {

});

event.on("DataMessage", function(buffer) {

});

event.on("error", function(error) {

});

//Send message
//event.send("SendSynMessage", {publicKey, channel, symmetricKey});
//event.send("SendDataMessage", buffer);
//event.send("JoinNetwork");
//event.send("CreateNetwork");3