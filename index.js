const { app } = require('electron');
var apple = require('./lib/apple.js')
var win = require('./lib/window');

app.on('ready', function() {
  if (process.platform === "darwin"){
    app.emit('loginOpen');

    apple.detectPlayer().then(result => {
        apple.replacePlayer(result);
    }).catch(error => process.exit())

    
  }
  else {
    console.log(process.platform + " is not supported.");
  }
});