tell application id "com.apple.iTunes"
    if player state is paused then
        set playerStateText to "Paused"
    else if player state is playing then
        set playerStateText to "Playing"
    else
        set playerStateText to "Stopped"
    end if
end tell
return playerStateText