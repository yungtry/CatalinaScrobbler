on run
    set info to ""
    tell application id "com.apple.iTunes"
        if song repeat is off then
            set playerStateText to false
        else if song repeat is one or song repeat is all then
            set playerStateText to true
        end if
    end tell
    return playerStateText
end run
