var osascript = require('node-osascript');
const { app } = require('electron');
const dJSON = require('dirty-json');
var lastfm = require('./lastfm-controller');
var win = require('./window');
var apple = require('./apple')


/*
Runs nowplaying.scpt and gets json with information about current playing song from the player.
*/
function getCurrentPlaying() {
    return new Promise(function(resolve, reject) {
            osascript.executeFile(__dirname+'/applescript/nowplaying.scpt', function(err, result, raw){
                if (err) {
                    console.log(err);
                    reject(Error(err));
                }
                resolve(result);
            });
    });
}

/*
Sends current playing song to Last.fm.
*/
function updateCurrentPlaying(playing) {
    var artist = playing.artist.replace(/%27/g, "'");
    var track = playing.track.replace(/%27/g, "'");
    var album = playing.album.replace(/%27/g, "'");
    if (playing.artist != undefined) lastfm.nowPlaying(artist, track, album);
}

/*
Scrobbles previous song.
*/
function scrobblePrevious(playing) {
    var artist = playing.artist.replace(/%27/g, "'");
    var track = playing.track.replace(/%27/g, "'");
    var album = playing.album.replace(/%27/g, "'");
    if (playing != undefined) lastfm.scrobble(artist, track, album)
}

/*
Main loop - updates data.
*/
function loop() {
        getCurrentPlaying().then(result => {
            updateCurrentPlaying(dJSON.parse(result));
            if (songStorage.current === undefined) {
                //Player is running for the first time.
                console.log("Running for the first time.")
                app.emit('trayUpdate', dJSON.parse(result), false)
                songStorage.time = 5;
                songStorage.ready = false;
                setTimeout(function(){ loop(); }, 5000);
            }
            else if (songStorage.current != result && songStorage.current != undefined) {
                //Song has changed.
                songStorage.previous = songStorage.current;
                app.emit('trayUpdate', dJSON.parse(result), false);
                if (songStorage.time >= Math.round(parseInt(dJSON.parse(songStorage.previous).duration))/2.5) {
                    //User has listened for more than half of the whole song.
                    scrobblePrevious(dJSON.parse(songStorage.previous));
                }
                songStorage.time = 5; //Reset timer. New song playing.
                songStorage.ready = false;
                setTimeout(function(){ loop(); }, 5000);
            }
            else {
                songStorage.time += 5; //Add 5 seconds to timer
                console.log(songStorage.time + "/" + Math.round(parseInt(dJSON.parse(result).duration)))
                if (songStorage.time >= Math.round(parseInt(dJSON.parse(result).duration))/2.5 && songStorage.ready == false) {
                    //Song is ready to be scrobbled.
                    console.log("Song ready to scrobble");
                    updateCurrentPlaying(dJSON.parse(result));
                    app.emit('trayUpdate', dJSON.parse(result), true);
                    songStorage.ready = true;
                }
                else if (songStorage.time >= Math.round(parseInt(dJSON.parse(result).duration))) {
                    //Song is in a loop mode.
                    console.log("Loop mode - scrobble");    
                    scrobblePrevious(dJSON.parse(result));
                    app.emit("trayUpdate", dJSON.parse(result), false);
                    songStorage.time = 5;
                    songStorage.ready = false;
                }
                setTimeout(function(){ loop(); }, 5000);
            }
            songStorage.current = result;
        }).catch(error => {
            //Player is paused or stopped.
            console.log(error);
            apple.getPlayerState().then(state =>{
                console.log(state);
                if (songStorage.time >= Math.round(parseInt(dJSON.parse(songStorage.current).duration))/2.5 && state == "Stopped"){
                    //Player is not playing anything nor is paused (EMPTY PLAYER, State: Stopped.).
                    scrobblePrevious(dJSON.parse(songStorage.current));
                    songStorage.time = 5;
                    songStorage.ready = false;
                }
                setTimeout(function(){ loop(); }, 5000);
            }).catch(err =>{
                console.log(err);
                setTimeout(function(){ loop(); }, 5000);
            });
            app.emit('trayUpdate', false, false);
        });
}

/*
Stores data
Example: previous song, current song, how long user has listened for the current song.
*/
class songStorage {
    previous;
    current;
    time;
    ready;
    constructor (previous, current, time, ready) {
        self.previous = previous;
        self.current = current;
        self.time = time;
        self.ready = ready;
    }
}

module.exports = {
    songStorage,
    getCurrentPlaying,
    updateCurrentPlaying,
    loop
}
