document.getElementById('bananaType').addEventListener("change", function (e) {
    // Set profile information.
    let bananaType = document.getElementById("bananaType").value;
    let data = {
        bananaType: bananaType
    };
    api.send("profile", data);
});
