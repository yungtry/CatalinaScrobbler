const API = require('last.fm.api');

/*
Login to Last.fm promise
*/
function login(login, password) {
    return new Promise(function(resolve, reject) {
        api = new API({ 
            apiKey: '21779adaae15c5fa727a08cd75909df2', 
            apiSecret: '8e2cfe09e0aac01bdc8474c2595d5e68',
            debug: true,
            username: login,
            password: password
        });
        api.auth.getMobileSession({})
        .then(json => json.session)
        .then(session => {
            keyStorage.sessionKey = session.key;
            keyStorage.username = session.name;
            keyStorage.password = password;
            resolve(session.key);
        })
        .catch(err => {
            reject(Error(err));
        });
    });
}
/*
Update currently playing song on Last.fm
*/
function nowPlaying (artist, track) {
    api.track.updateNowPlaying({
        artist: artist,
        track: track,
        sk: keyStorage.sessionKey
    })
}

/*
Scrobbles to Last.fm
*/
function scrobble(artist, track) {
    api.track.scrobble({
        tracks: [
            {
                artist: artist,
                track: track,
                timestamp: Date.now() / 1000
            }
        ],
        sk: keyStorage.sessionKey
    });
}


/*
Class to store keys. 
Example: session key, username, password.
*/
class keyStorage {
    sessionKey;
    username;
    password;
    constructor(sessionKey) {
        self.sessionKey = sessionKey;
        self.username = username;
        self.password = password;
    }
}

module.exports = {
    login,
    nowPlaying,
    keyStorage,
    scrobble
}