dialog = null;
// This might not be needed but shows how dialog boxes work
var run = function () {

}

var runCommand = function (command) {
  dialog.showMessageBox({type: "info", title: "Running Command", message: "Command is being executed with command '" + command + "'"}, function(number, checkbox) {

  });
}

var runScript = function (path) {
  dialog.showMessageBox({ type: "info", title: "Running Script", message: "Script is being executed with path '" + path + "'" }, function (number, checkbox) {

  });
}

module.exports = function (_dialog) {
  dialog = _dialog;
  
  return {
    runCommand: runCommand,
    runScript: runScript
  }
}