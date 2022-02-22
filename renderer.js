// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process because
// `nodeIntegration` is turned off. Use `preload.js` to
// selectively enable features needed in the rendering
// process.
document.getElementById('submit').addEventListener("click", function (e) {
    // Validate license key.
    let licenseKey = document.getElementById("licenseKey").value;
    let data = {
        licenseKey: licenseKey
    };
    api.send("initialize", data);
});

// If the validation failed, render an error on the UI.
api.handle('initialize', ( event, data ) => function( event, data ) {
    if (typeof data === "object" && "error" in data && data.error) {
        document.getElementById("error").innerText = data.error;
    }
}, event);