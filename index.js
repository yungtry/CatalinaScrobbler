const { app } = require('electron');
var apple = require('./lib/apple.js')
var win = require('./lib/window');

app.on('ready', function() {
    if (process.platform === "darwin"){
        apple.autoLaunchEnabled().then(enabled => {
            if (enabled === true) {
                //Re-enable autolaunch because there was a bug when installing new version of the app.
                apple.autoLaunchDisable();
                apple.autoLaunchEnable();
            }
        });
        apple.detectPlayer().then(result => {
            console.log("Player detected: "+result);
            // apple.replacePlayer(result);
        }).catch(error => process.exit())
        if (apple.rememberUser() === false){
            app.emit('loginOpen');
        }
        else {
            app.emit('trayCreate');
        }
  }
  else {
    console.log(process.platform + " is not supported.");
  }
});

//Prevents application from closing when there are no windows available.
app.on('window-all-closed', e => e.preventDefault() )
