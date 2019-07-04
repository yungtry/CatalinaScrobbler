const fs = require('fs');
fs.writeFile("/tmp/CurrentPlaying.scpt", `on run
	set info to ""
	tell application id "com.apple.systemevents"
		set num to count (every process whose bundle identifier is "com.apple.Music")
	end tell
	if num > 0 then
		tell application id "com.apple.Music"
			if player state is playing then
				set track_name to name of current track
				set track_artist to the artist of the current track
				set track_album to the album of the  current track
			end if
		end tell
	end if
	return "{\\"artist\\":\\"" & track_artist & "\\", \\"track\\":\\"" & track_name & "\\", \\"album\\":\\"" & track_album & "\\"}"
end run`, function(err) {
    if(err) {
        return console.log(err);
    }
}); 

var LastfmAPI = require('lastfmapi');
var Lastfm = require('simple-lastfm');
const { exec } = require('child_process');
var Prompt = require('prompt-password');
var readline = require('readline');

global.timeline = 0
global.songCount = 0;

var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});
rl.stdoutMuted = true;
rl.question('Login: ', (login) => {
	var prompt = new Prompt({
	  type: 'password',
	  message: 'Password: ',
	  name: 'password'
	});
	prompt.run()
	  .then(function(password) {
		lastFMLogin(login, password);
		rl.close();
	  });
});

function lastFMLogin(login, pass){
	var lfm = new LastfmAPI({
		'api_key' : '21779adaae15c5fa727a08cd75909df2',
		'secret' : '8e2cfe09e0aac01bdc8474c2595d5e68'
	});
	var lastfm = new Lastfm({
		api_key: '21779adaae15c5fa727a08cd75909df2',
		api_secret: '8e2cfe09e0aac01bdc8474c2595d5e68',
		username: login,
		password: pass
	});
	lastfm.getSessionKey(function(result) {
		//console.log("session key = " + result.session_key);
		if(result.success) {
			lfm.setSessionCredentials(login, result.session_key);
			update(lfm);
		} else {
			console.log("Error: " + result.error);
		}
	});
}

function update(lfm) {

	setInterval(function(){ 
		console.log("==============================");
		global.timeline += 1;
		console.log("Loop: "+global.timeline);
		exec('osascript /tmp/CurrentPlaying.scpt', (error, stdout, stderr) => {
			if (error) {
			  console.error(`exec error: ${error}`);
			  console.log("Is music playing?")
			  global.timeline -= 1; //pause cause not playing anything
			  //global.songCount = 0; //scrobble reset
			  return;
			}
			console.log(`Now Playing: ${stdout}`);
			//console.log(`stderr: ${stderr}`);
			var obj = JSON.parse(stdout);

			if (stdout != undefined && stdout != global.playing){
				//song changed
				global.previousTime = global.timeline;
				global.timeline = 0;
				global.songCount += 1;
				global.previous = global.playing;
				console.log("SongCount: "+global.songCount);
				if (global.songCount > 1){
					console.log("Scrobble Previous");
					console.log("Previous: "+global.previous);
					var previousSong = JSON.parse(global.previous);
					if (global.previousTime > 12){ //if listened for more than 60 seconds
						lfm.track.scrobble({
							'artist' : previousSong.artist,
							'track' : previousSong.track,
							'timestamp' : Math.floor(Date.now() / 1000)
						}, function (err, scrobbles) {
							if (err) { return console.log('We\'re in trouble', err); }
						
							console.log('We have just scrobbled:', scrobbles);
						});
					}
					global.playing = stdout;
				}
				else {
					//first run not scrobbling
					global.playing = stdout;
				}
			}

			if (stdout != undefined){
				lfm.track.updateNowPlaying({
					'artist' : obj.artist,
					'track' : obj.track,
					'album' : obj.album
				
				}, function(err, nowPlaying){
					console.log(nowPlaying);
				})
			}
		});
	}, 5000);
}

process.on('SIGINT', function() {
    console.log("Caught interrupt signal");
    process.exit();
});