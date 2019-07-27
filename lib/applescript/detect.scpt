try
    tell application "Finder" to get application file id "com.apple.Music"
    set appExists to true
on error
    set appExists to false
end try
return appExists