on run
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
	set output to "{\"artist\":\"" & track_artist & "\", \"track\":\"" & track_name & "\", \"album\":\"" & track_album & "\"}"
	do shell script "echo '" & output & "' > /tmp/CurrentPlaying.json"
	return output
end run
