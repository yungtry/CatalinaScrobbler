var osascript = require('node-osascript');
var keychain = require('keychain');
const { app } = require('electron')
var AutoLaunch = require('auto-launch');
const lastfm = require('./lastfm-controller');
var fs = require('fs');
process.player = "Music";

/*
Detects what player is installed on user's computer (iTunes or Apple Music).
*/
function detectPlayer() {
    return new Promise(function(resolve, reject) {
        osascript.executeFile(__dirname + '/applescript/detect.scpt', function(err, result, raw){
            if (err) reject(Error(err));
            if (result == false) {
                process.player =  "iTunes"
                resolve("iTunes")
            }
            else if (result == true) {
                process.player = "Music"
                resolve("Music")
            } 
            else {
                process.player = "iTunes"
                resolve("Music")
            }
        });
    });
}

/*
Promise checking the state of a player.
*/
function getPlayerState() {
    return new Promise(function(resolve, reject) {
        osascript.executeFile(__dirname +'/applescript/' + process.player + '/state.scpt', function(err, result, raw){
            if (err) reject(err);
            resolve(result);
        });   
    });
}

/*
Promise checking if player is in the loop mode
*/
function getLoopMode() {
    return new Promise(function(resolve, reject) {
        osascript.executeFile(__dirname+'/applescript/' + process.player + 'loop.scpt', function(err, result, raw){
            if (err) reject(err);
            resolve(result);
        });         
    });
}

/*
Handles saving preferences after pressing "Save" button in preferences.
*/
function savePreferences(arg) {
    if (arg.first === true) {
        keychain.setPassword({ account: lastfm.keyStorage.username, service: 'CatalinaScrobbler', password: lastfm.keyStorage.password }, function(err) {
            if (err) console.log(err);
            fs.writeFile(process.env.HOME+"/.catalinascrobbler", lastfm.keyStorage.username, 'utf8', function (err) {
                if (err) console.log(err);
            });
        });
    }
    if (arg.first === false) {
        keychain.deletePassword({ account: lastfm.keyStorage.username, service: 'CatalinaScrobbler', password: lastfm.keyStorage.password }, function(err) {
            if (err) console.log(err);
            fs.access(process.env.HOME+"/.catalinascrobbler", fs.F_OK, (err) => {
                if (err) console.log(err);
                fs.unlink(process.env.HOME+"/.catalinascrobbler", function(err){
                    if (err) console.log(err);
                });
            })
        });
    }
    if (arg.second === true) {
        autoLaunchEnable();
    }
    if (arg.second === false) {
        autoLaunchDisable();
    }
}

/*
Checks if username and password is saved in keychain and home directory.
*/
function rememberUser() {
    if (fs.existsSync(process.env.HOME+"/.catalinascrobbler")) {
        keychain.getPassword({ account: fs.readFileSync(process.env.HOME+"/.catalinascrobbler"), service: 'CatalinaScrobbler' }, function(err, pass) {
            lastfm.login(fs.readFileSync(process.env.HOME+"/.catalinascrobbler"),pass).then(result => {
                app.dock.hide();
                console.log(result); 
                return true;
            }).catch(err => {
                console.log(err); 
                app.emit('loginOpen'); 
                return false;
            });
            return true;
        });
    }
    else {
        return false;
    }
}

/*
Summarized version of the rememberUser() function for use within preferences.html
*/
function preferencesRememberUser() {
    if (fs.existsSync(process.env.HOME+"/.catalinascrobbler")) {
        return true;
    }
    else {
        return false;
    }
}

/*
As the name says, it enables auto launch of the application upon system's startup
*/
function autoLaunchEnable() {
    if (__dirname.includes(".app")){
        try {
            var appPath = app.getPath('exe').split('.app/Content')[0] + '.app';
            al = new AutoLaunch({
            name: app.getName(),
            path: appPath,
            });
            al.enable();
        } catch (err) {
            console.log(err);
        }
    }

}
/*
As the name says, it disables auto launch of the application upon system's startup
*/
function autoLaunchDisable() {
    if (__dirname.includes(".app")){
        try {
            var appPath = app.getPath('exe').split('.app/Content')[0] + '.app';
            al = new AutoLaunch({
            name: app.getName(),
            path: appPath,
            });
            al.disable();
        } catch (err) {
            console.log(err);
        }
    }
}
/*
Promise to check if autolaunch is enabled.
*/
function autoLaunchEnabled() {
    return new Promise(function(resolve, reject) {
        if (__dirname.includes(".app")){
            try {
                var appPath = process.execPath.split('.app/Content')[0] + '.app';
                al = new AutoLaunch({
                name: "CatalinaScrobbler", //Hard coded, TODO: Find a way to access it from a browser.
                path: appPath,
                });
                al.isEnabled()
                .then(function(isEnabled){
                    if (isEnabled) {
                        resolve(true);
                    }
                    else {
                        resolve(false);
                    }
                })
                .catch(function(err){
                    console.log(err);
                    resolve(false);
                });
            } catch (err) {
                console.log(err);
                resolve(false);
            }
        }
        else {
            resolve(false);
        }
    });
}

module.exports = {
    detectPlayer,
    // replacePlayer,
    savePreferences,
    rememberUser,
    autoLaunchEnable,
    autoLaunchEnabled,
    autoLaunchDisable,
    preferencesRememberUser,
    getPlayerState,
    getLoopMode    
}
