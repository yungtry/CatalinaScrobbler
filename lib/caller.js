/*
I was going to use this as a middleman between player.js and tray.js, but it tourned out that I do not need it.
*/

var player = require('./player');

function loop () {
    player.loop();
}

module.exports = {
    loop
}