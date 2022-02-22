// Send a ping to our main process ever 60 seconds.
// This ping will kickoff a license validation check to make
// sure the user's license is still valid (ie. not banned, revoked, etc.)
setTimeout(function() {
    api.send("validate", "ping");
}, 60 * 1000);