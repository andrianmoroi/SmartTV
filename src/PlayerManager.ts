import { exec, execSync } from 'child_process'

export class PlayerManager {

    public play(videoUrl: string): boolean {
        let runCommand = `node tools/start_player.js \"${videoUrl}\"`

        this.stopPlayingVideo()

        return this.executeProcess(runCommand)
    }

    public playLoop(videoUrl: string): boolean {

        let runCommand = `node tools/start_player_loop.js \"${videoUrl}\"`

        this.stopPlayingVideo()

        return this.executeProcess(runCommand)
    }

    public stopPlayingVideo() {
        let runCommand = `node tools/stop_player.js`
        // let runCommand = "ps -aux | egrep \"[t]ools/player\.py|[t]ools/player_loop\.py|[s]treamlink|[o]mxplayer\" | grep -Po \"^[a-zA-Z0-9]+ *?\\d+\" | grep -Po \"\\d+\" | xargs --no-run-if-empty kill";

        try {
            console.log("stop playing proccesses")

            execSync(runCommand)
        }
        catch (e) {
            console.log(e)
        }

        console.log('Stopped player proccess')
    }

    private executeProcess(command: string): boolean {
        try {
            let p = exec(command, (error, response) => {
                console.log(`Proccess[${p.pid}] finished error: ${error}`)
                console.log(`Proccess[${p.pid}] finished response: ${response}`)
            })

            if (p && p.stdout && p.stderr) {
                p.stdout.on('data', function (data) {
                    console.log('stdout: ' + data.toString())
                })

                p.stderr.on('data', function (data) {
                    console.log('stderr: ' + data.toString())
                })
            }

            p.on('exit', function (code) {
                console.log(`Proccess[${p.pid}] exited with code: ${code || Number.NaN}`)
            })

            return true
        }
        catch (e) {
            console.log(e)

            return false
        }
    }

}