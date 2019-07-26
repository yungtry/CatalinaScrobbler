const { app } = require('electron');
var apple = require('./lib/apple.js')
var win = require('./lib/window');

app.on('ready', function() {
  if (process.platform === "darwin"){
    if (apple.rememberUser() === false){
      app.emit('loginOpen');
    }
    else {
      app.emit('trayCreate');
    }

    apple.detectPlayer().then(result => {
        apple.replacePlayer(result);
    }).catch(error => process.exit())

    
  }
  else {
    console.log(process.platform + " is not supported.");
  }
});

app.on('window-all-closed', e => e.preventDefault() )