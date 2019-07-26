const { app, BrowserWindow, ipcMain } = require('electron');
var path = require('path');
var btn = require('./lib/button.js');
var window = require('./lib/window.js');
var apple = require('./lib/apple.js')

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
var mainWindow = null;

// Quit when all windows are closed.
app.on('window-all-closed', function() {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform != 'darwin') {
    app.quit();
  }
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.on('ready', function() {
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
    icon: path.join(__dirname, 'assets/icons/icon.icns')
    //resizable: false,
  });
  //window icon in dock
  mainWindow.setIcon(path.join(__dirname, 'assets/icons/icon.png'));


  // and load the index.html of the app.
  mainWindow.loadFile(__dirname + '/assets/html/login.html');

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

  apple.detectPlayer().then(result => {
      apple.replacePlayer(result);
  }).catch(error => process.exit())

  ipcMain.on('btn-event', (event, arg) => {
    btn.handle(event, arg);
  })
  ipcMain.on('window-event', (event, arg) => {
    window.handle(event, arg, mainWindow);
  })
});