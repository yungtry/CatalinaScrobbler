var osascript = require('node-osascript');
const { Menu, app } = require('electron');
var path = require('path');
const dJSON = require('dirty-json');
var lastfm = require('./lastfm-controller');
var win = require('./window');


/*
Runs nowplaying.scpt and gets json with information about current playing song from the player.
*/
function getCurrentPlaying() {
    return new Promise(function(resolve, reject) {
        osascript.executeFile(__dirname+'/applescript/nowplaying.scpt', function(err, result, raw){
            if (err) {
                reject(Error(err));
                app.emit('trayUpdate', false)
            }
            resolve(result);
        });
    });
}

/*
Sends current playing song to Last.fm.
*/
function updateCurrentPlaying(playing) {
    if (playing.artist != undefined) lastfm.nowPlaying(playing.artist, playing.track);
    
}

/*
Scrobbles previous song.
*/
function scrobblePrevious(playing) {
    if (playing != undefined) lastfm.scrobble(playing.artist, playing.track)
}

/*
Main loop - updates data.
*/
function loop() {
    setInterval(function(){ 
        getCurrentPlaying().then(result => {
            updateCurrentPlaying(dJSON.parse(result));
            if (songStorage.current === undefined) {
                //Player is running for the first time.
                console.log("Running for the first time.")
                app.emit('trayUpdate', dJSON.parse(result))
                songStorage.time = 0;
            }
            else if (songStorage.current != result && songStorage.current != undefined) {
                //Song has changed.
                songStorage.previous = songStorage.current;
                app.emit('trayUpdate', dJSON.parse(result))
                if (songStorage.time >= Math.round(parseInt(dJSON.parse(songStorage.previous).duration))/2) {
                    //User has listened for more than half of the whole song.
                    scrobblePrevious(dJSON.parse(songStorage.previous));
                }
                songStorage.time = 0; //Reset timer. New song playing.
            }
            else {
                songStorage.time += 5; //Add 5 seconds to timer
                console.log(songStorage.time + "/" + Math.round(parseInt(dJSON.parse(result).duration)))
            }
            songStorage.current = result;
        }).catch(error => {
            //Player is paused.
            console.log(error);
            app.emit('trayUpdate', false)
        }) 
    }, 5000);
}

/*
Updates current playing song in the context menu.
Note: I had to import it from tray.js cause it returned error <"updateContextMenu is not a function.">
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
*/
/*
Stores data
Example: previous song, current song, how long user has listened for the current song.
*/
class songStorage {
    previous;
    current;
    time;
    constructor (previous, current, time) {
        self.previous = previous;
        self.current = current;
        self.time = time;
    }
}

module.exports = {
    songStorage,
    getCurrentPlaying,
    updateCurrentPlaying,
    loop
}