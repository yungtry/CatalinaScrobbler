const { app, ipcMain, BrowserWindow } = require('electron');
var tray = require('./tray');
var path = require('path');
var button = require('./button');
var apple = require('./apple');


// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
var mainWindow = null;
var settingsWindow = null;

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


  // and load the index.html of the app.
  mainWindow.loadFile(__dirname + '/../assets/html/login.html');

  // Open the DevTools.
  //mainWindow.openDevTools();

  // Emitted when the window is closed.
  mainWindow.on('closed', function() {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
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
        settingsWindow.close();
        app.dock.hide();
        windowStorage.preferencesOpened = false;
    })

});
/*
Handles windows
*/
function handle(event, arg, window) {
    switch (arg) {
        case "loginClose":
            console.log("loginClose");
            app.emit('trayCreate');
            window.close();
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
            window.close();
            break;
    }
}
/*
TODO: Creates window
*/
function create() {

}

module.exports = {
    handle,
    create
}

class windowStorage {
    preferencesOpened = false;
    constructor (preferencesOpened) {
        self.preferencesOpened = preferencesOpened;
    }
}