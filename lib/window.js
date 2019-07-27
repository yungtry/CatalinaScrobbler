const { app, ipcMain, BrowserWindow } = require('electron');
var tray = require('./tray');
var path = require('path');
var button = require('./button');
var apple = require('./apple');


// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
var mainWindow = null;
var settingsWindow = null;

/*
Event: Creates login window.
*/
app.on('loginOpen', function(){
  console.log("aaaaa");
  // Create the browser window.
  mainWindow = new BrowserWindow({
    webPreferences: {nodeIntegration: true},
    width: 400,
    height: 400,
    'min-width': 200,
    'min-height': 200,
    'accept-first-mouse': true,
    'title-bar-style': 'hidden',
    title: "CatalinaScrobbler",
    icon: path.join(__dirname, '/../assets/icons/icon.icns')
    //resizable: false,
  });
  //window icon in dock
  mainWindow.setIcon(path.join(__dirname, '/../assets/icons/icon.png'));

  mainWindow.loadFile(__dirname + '/../assets/html/login.html');

  // Emitted when the window is closed.
  mainWindow.on('closed', function() {
    mainWindow = null;
    process.exit();
  });
  ipcMain.on('window-event', (event, arg) => {
    handle(event, arg, mainWindow);
  })
  app.on('mainWindowHide', function(){
      mainWindow.hide();
  })
})

/*
Event: Creates preferences window.
*/
app.on('preferencesOpen', function (){
    if (!windowStorage.preferencesOpened) {
        app.dock.show();
        settingsWindow = new BrowserWindow({
          webPreferences: {nodeIntegration: true},
          width: 400,
          height: 400,
          'min-width': 200,
          'min-height': 200,
          'accept-first-mouse': true,
          'title-bar-style': 'hidden',
          title: "CatalinaScrobbler",
          icon: path.join(__dirname, '/../assets/icons/icon.icns')
          //resizable: false,
        });
        settingsWindow.loadFile(__dirname+"/../assets/html/preferences.html")
        windowStorage.preferencesOpened = true;
    }
    settingsWindow.on('closed', () => {
        settingsWindow = null
        windowStorage.preferencesOpened = false;
        app.dock.hide();
    })
    ipcMain.on('window2-event', (event, arg) => {
        handle(event, arg, settingsWindow);
    })
    ipcMain.on('save-event', (event, arg) => {
        apple.savePreferences(arg);
        try {
            settingsWindow.close();
        } catch (err) {
            console.log(err);
        }
        app.dock.hide();
        windowStorage.preferencesOpened = false;
    })

});
/*
Handles window's actions.
*/
function handle(event, arg, window) {
    switch (arg) {
        case "loginClose":
            console.log("loginClose");
            app.emit('trayCreate');
            window.hide();
            app.dock.hide();
            break;
        case "rememberTrue":
            break;
        case "preferencesSave":
            apple.savePreferences(arg);
            break;
        case "preferencesClose":
            windowStorage.preferencesOpened = false;
            app.dock.hide();
            try {
                window.close();
                window = null;
            }
            catch (err) {
                console.log(err);
            }
            break;
    }
}
/*
TODO: Creates window
*/
function create() {

}
/*
Class to store informations about windows.
*/
class windowStorage {
    preferencesOpened = false;
    constructor (preferencesOpened) {
        self.preferencesOpened = preferencesOpened;
    }
}

module.exports = {
    handle,
    create
}