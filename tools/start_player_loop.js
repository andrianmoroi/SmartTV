const execSync = require('child_process').execSync;

if (process.argv && process.argv.length < 3) {
    console.log("Need to provide an url")
    process.exit(1)
}
// process.exit(1)

console.log("player")

let url = process.argv[2]
let runCommand = `omxplayer -o hdmi --threshold 0.5 --loop ${url}`

// process.on('exit', function(code) {
//     return console.log(`About to exit with code ${code}`);
// });

while (true) {
    try {
        execSync(runCommand)
    }
    catch (e) {
        console.log(e)
    }
}