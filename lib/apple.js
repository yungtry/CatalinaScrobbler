var osascript = require('node-osascript');
var fs = require('fs')

/*
Detects what player is installed on user's computer (iTunes or Apple Music).
*/
function detectPlayer() {
    return new Promise(function(resolve, reject) {
        osascript.executeFile(__dirname+'/applescript/detect.scpt', function(err, result, raw){
            if (err) reject(Error(err));
            if (result == false) {
                resolve("iTunes")
            }
            else if (result == true) {
                resolve("Music")
            } 
            else {
                resolve("Music")
            }
        });
    });
}

/*
Replaces string x with a name of the player in the file applescript/nowplaying.scpt
*/
async function replacePlayer(player) {   
    fs.readFile(__dirname+'/applescript/nowplaying.scpt', 'utf8', function (err,data) {
        if (err) {
            return console.log(err);
        }
        var result = data.replace(/0x/g, player);
        result = data.replace(/iTunes/g, player);
        result = data.replace(/Music/g, player);
        fs.writeFile(__dirname+'/applescript/nowplaying.scpt', result, 'utf8', function (err) {
            if (err) return console.log(err);
        });
    });
}

module.exports = {
    detectPlayer,
    replacePlayer
}