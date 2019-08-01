const { Tray, app, Menu } = require('electron');
var open = require('open');
var player= require('./player');
var lastfm = require('./lastfm-controller');

/*
Event: Creates icon in the menubar
*/
app.on('trayCreate', function(){
    console.log("TrayCreate");
    tray = new Tray(__dirname+'/../assets/icons/trayTemplate.png')
    updateContextMenu(false);
    player.loop();
    app.on('trayUpdate', function(playing, checkmark){
        updateContextMenu(playing, checkmark);
    });
})

/*
Updates current playing song in the context menu.
*/
function updateContextMenu(playing, checkmark) {
    console.log("Update: "+JSON.stringify(playing));
    if (playing === false) {
        var label = "Paused";
    }
    else {
        var artist = playing.artist.replace(/%27/g, "'");
        var track = playing.track.replace(/%27/g, "'");
        var label = artist + " - " + track;
    }
    if (checkmark == true) {
        var type = 'radio';
    }
    else {
        var type = null;
    }
    const contextMenu = Menu.buildFromTemplate([
        {
            label: label,
            click: (item, window, event) => {
                open('http://last.fm/user/' + lastfm.keyStorage.username);
            },
            type: type
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

    contextMenu.items[1].checked = checkmark;
    tray.setContextMenu(contextMenu);
}