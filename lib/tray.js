const { Tray } = require('electron')
var player = require('./player');

/*
Creates tray template
*/
function createTray() {
    tray = new Tray(__dirname+'/../assets/icons/trayTemplate.png')
    player.updateContextMenu(false);
    player.loop()
    //player.updateContextMenu(false);
}

/*
Updates current playing song in the context menu.
*/
/*
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
*/

module.exports = {
    createTray,
    //updateContextMenu
}