on run
	set info to ""
	tell application id "com.apple.systemevents"
		set num to count (every process whose bundle identifier is "com.apple.iTunes")
	end tell
	if num > 0 then
		tell application id "com.apple.iTunes"
			if player state is playing then
				set track_name to name of current track
				set track_artist to the artist of the current track
				set track_album to the album of the  current track
                set track_duration to (get duration of the current track)
			end if
		end tell
	end if
	return "{'artist':'" & encodeText(track_artist, false, false) & "', 'track': '" & encodeText(track_name, false, false) & "', 'album':'" & encodeText(track_album, false, false) & "', 'duration': '" & track_duration &"'}"
end run


# https://developer.apple.com/library/archive/documentation/LanguagesUtilities/Conceptual/MacAutomationScriptingGuide/EncodeandDecodeText.html
on encodeText(theText, encodeCommonSpecialCharacters, encodeExtendedSpecialCharacters)
    set theStandardCharacters to "abcdefghijklmnopqrstuvwxyz0123456789 "
    set theCommonSpecialCharacterList to "$+!'/?;&@=#%><{}\"~`^\\|*"
	set charList to "'"
    set theExtendedSpecialCharacterList to ".-_:"
    set theAcceptableCharacters to theStandardCharacters
    if encodeCommonSpecialCharacters is false then set theAcceptableCharacters to theAcceptableCharacters & theCommonSpecialCharacterList
    if encodeExtendedSpecialCharacters is false then set theAcceptableCharacters to theAcceptableCharacters & theExtendedSpecialCharacterList
    set theEncodedText to ""
    repeat with theCurrentCharacter in theText
        if theCurrentCharacter is not in charList then
			log theCurrentCharacter
            set theEncodedText to (theEncodedText & theCurrentCharacter)
        else
            set theEncodedText to (theEncodedText & encodeCharacter(theCurrentCharacter)) as string
        end if
    end repeat
    return theEncodedText
end encodeText

on encodeCharacter(theCharacter)
    set theASCIINumber to (the ASCII number theCharacter)
    set theHexList to {"0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "A", "B", "C", "D", "E", "F"}
    set theFirstItem to item ((theASCIINumber div 16) + 1) of theHexList
    set theSecondItem to item ((theASCIINumber mod 16) + 1) of theHexList
    return ("%" & theFirstItem & theSecondItem) as string
end encodeCharacter