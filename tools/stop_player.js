const execSync = require('child_process').execSync;

let runCommand = "ps -aux | egrep \"[t]ools/start_player.js|[t]ools/start_loop_player.js|[s]treamlink|[o]mxplayer\" | grep -Po \"^[a-zA-Z0-9]+ *?\\d+\" | grep -Po \"\\d+\" | xargs --no-run-if-empty kill";

try {
    execSync(runCommand)
}
catch (e) {
    console.log(e)
}
