const execSync = require('child_process').execSync;

if (process.argv && process.argv.length < 3) {
    console.log("Need to provide an url")
    process.exit(1)
}

let url = process.argv[2]
let runCommand = `omxplayer -o hdmi --threshold 0.5 ${url}`

while (true) {
    try {
        execSync(runCommand)

        console.log("finished process")
    }
    catch (e) {
        console.log(e)
    }
}