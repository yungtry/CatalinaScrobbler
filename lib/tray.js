const { Tray, app, Menu } = require('electron');
var open = require('open');
var player= require('./player');
var lastfm = require('./lastfm-controller');

/*
Creates tray template
*/
app.on('trayCreate', function(){
    console.log("TrayCreate");
    tray = new Tray(__dirname+'/../assets/icons/trayTemplate.png')
    updateContextMenu(false);
    player.loop();
    app.on('trayUpdate', function(playing){
        updateContextMenu(playing);
    });
})

/*
Updates current playing song in the context menu.
*/
function updateContextMenu(playing) {
    console.log("Update: "+playing)
    if (playing === false) {
        var label = "Paused";
    }
    else {
        var label = playing.artist + " - " + playing.track;
    }
    const contextMenu = Menu.buildFromTemplate([
        {
            label: label,
            click: (item, window, event) => {
                open('http://last.fm/user/' + lastfm.keyStorage.username);
            }
        },
        {
            label: "Preferences",
            click: (item, window, event) => {
                app.emit("preferencesOpen");
                //do something
            }
        },
        {
            label: 'Quit',
            role: "quit"
        }
    ])
    tray.setContextMenu(contextMenu);
}