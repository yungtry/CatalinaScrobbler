const { app } = require('electron');
var tray = require('./tray')

/*
Handles windows
*/
function handle(event, arg, window) {
    switch (arg) {
        case "loginClose":
            console.log("loginClose");
            window.hide();
            app.dock.hide();
            tray.createTray();
    }
}

function create() {

}

module.exports = {
    handle,
    create
}