const { dialog, ipcMain } = require('electron')
var lastfm = require('./lastfm-controller');

/*
Handles buttons
*/
function handle(event, arg) {
    if (arg.state === undefined) {
        var state = arg;
    }
    else {
        var state = arg.state;
    }
    switch (state) {
        case "loginOK":
            console.log("OK");
            if (arg.login != undefined) {
                lastfm.login(arg.login, arg.password).then(result => {
                    console.log("Logged in: "+result);
                    event.reply('btn-event', "loginTrue");
                    
                }).catch(err => {
                    dialog.showMessageBox(err);
                    event.reply('btn-event', "loginFalse");
                });

            }
            break;
        case "loginCancel":
            console.log("cancel");
            process.exit();
            break;
    }
}

module.exports = {
    handle
}