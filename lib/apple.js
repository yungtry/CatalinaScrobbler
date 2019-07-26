var osascript = require('node-osascript');
const { app } = require('electron')
const dJSON = require('dirty-json');
var AutoLaunch = require('auto-launch');
var path = require('path');
const lastfm = require('./lastfm-controller');
var fs = require('fs');

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

function savePreferences(arg) {
    if (arg.first === true) {
        let json = "{login: \""+Buffer.from(lastfm.keyStorage.username).toString('base64')+"\", password: \""+Buffer.from(lastfm.keyStorage.password).toString('base64')+"\"}"
        console.log(json);
        fs.writeFile(path.join(__dirname, '/../pass.txt'), json, 'utf8', function (err) {
            if (err) return console.log(err);
        });
    }
    else if (arg.first === false) {
        fs.access(path.join(__dirname, '/../pass.txt'), fs.F_OK, (err) => {
            if (err) return console.log(err);
            fs.unlink(path.join(__dirname, '/../pass.txt'), function(err){
                if (err) return console.log(err);
            });
          })
    }
    if (arg.second === true) {
        autoLaunchEnable();
    }
    else if (arg.second === false) {
        autoLaunchDisable();
    }
}

function rememberUser() {
    try {
        if (fs.existsSync(path.join(__dirname, '/../pass.txt'))) {
            let rawdata = fs.readFileSync(path.join(__dirname, '/../pass.txt'));
            console.log(Buffer.from(dJSON.parse(rawdata).login, 'base64').toString('utf8'));
            lastfm.login(Buffer.from(dJSON.parse(rawdata).login, 'base64').toString('utf8'), Buffer.from(dJSON.parse(rawdata).password, 'base64').toString('utf8'))
            return true;
        }
        else {
            return false;
        }
    } catch(err) {
        console.log(err);
        return false;
    }
    console.log("123123");
}

function autoLaunchEnable() {
    if (__dirname.includes(".app")){
        var alPath = __dirname.substring(0, __dirname.indexOf('.app'));
        var al = new AutoLaunch({
            name: 'CatalinaScrobbler',
            path: alPath,
        });
        al.enable();
    }

}

function autoLaunchDisable() {
    if (__dirname.includes(".app")){
        var alPath = __dirname.substring(0, __dirname.indexOf('.app'));
        var al = new AutoLaunch({
            name: 'CatalinaScrobbler',
            path: alPath,
        });
        al.disable();
    }
}

function autoLaunchEnabled() {
    if (__dirname.includes(".app")){
        var alPath = __dirname.substring(0, __dirname.indexOf('.app'));
        var al = new AutoLaunch({
            name: 'CatalinaScrobbler',
            path: alPath,
        });
        al.isEnabled()
        .then(function(isEnabled){
            if (isEnabled) return true;
            else return false;
        })
        .catch(function(err){
            return false;
        });
    }
    else {
        return false;
    }
}

module.exports = {
    detectPlayer,
    replacePlayer,
    savePreferences,
    rememberUser,
    autoLaunchEnable,
    autoLaunchEnabled,
    autoLaunchDisable
}