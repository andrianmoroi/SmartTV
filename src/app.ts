import { exec, execSync } from 'child_process';
import express from 'express';
import { RedisContext } from './RedisContext';
import { WebSocketManager } from './WebSocketManager';

let port = process.env.PORT || 3000
let wssPort = 7878
let app: express.Application = express()
let redis = new RedisContext("localhost", 6379)
let wss = new WebSocketManager(wssPort)


redis.get("a").then(m => console.log(m))
redis.setOject("b", { a: 12, b: 15 })

app.use(express.json());
app.use(express.static('public'))

app.get("/api/getAllChannels", (req, res) => {
    res.sendFile(`${process.cwd()}/sources/channels.json`)
})

app.get("/api/getRelaxingVideos", (req, res) => {
    res.sendFile(`${process.cwd()}/sources/relaxing_videos.json`)
})

app.get("/api/getHostName", (req, res) => {

    try {
        exec("hostname -I", (error, response) => {
            if (error) {
                console.log(error);
                res.sendStatus(500)
            }

            res.send(response)
        })
    }
    catch (e) {
        console.log(e);
        res.sendStatus(500)
    }
})

app.post("/api/start", (req, res) => {
    stopPlayingVideo();

    let name = req.body.name;
    let url = req.body.url;
    let runCommand = `python3 tools/player.py \"${url}\"`;

    try {
        exec(runCommand, (error, response) => {
            console.log(error);
            console.log(response);
        })

        wss.sendMessage(`Now is playing ${name}...`)
    }
    catch (e) {
        console.log(e);
    }

    res.sendStatus(200)
})

app.post("/api/startLoop", (req, res) => {
    stopPlayingVideo();

    let name = req.body.name;
    let url = req.body.url;
    let runCommand = `python3 tools/player_loop.py \"${url}\"`;

    try {

        console.log("before playing")
        let p = exec(runCommand, (error, response) => {
            console.log(error);
            console.log(response);
        });

        if(p && p.stdout && p.stderr)
        {
            p.stdout.on('data', function (data) {
                console.log('stdout: ' + data.toString());
            });
    
            p.stderr.on('data', function (data) {
                console.log('stderr: ' + data.toString());
            });
        }
    
        p.on('exit', function (code) {
            console.log('child process exited with code ' + (code || -10000).toString());
        });

        console.log("after playing")

        wss.sendMessage(`Now is playing ${name}...`)
    }
    catch (e) {
        console.log(e);
    }

    res.sendStatus(200)
})

app.post("/api/stop", (req, res) => {
    stopPlayingVideo();

    wss.sendMessage(`Nothing is playing now...`)

    res.sendStatus(200)
})

app.listen(port, () => {
    console.log("listen to port " + port)
})

function stopPlayingVideo() {
    let pidsToStop = "ps -aux | egrep \"[t]ools/player\.py|[t]ools/player_loop\.py|[s]treamlink|[o]mxplayer\" | grep -Po \"^[a-zA-Z0-9]+ *?\\d+\" | grep -Po \"\\d+\" | xargs --no-run-if-empty kill";

    try {
        execSync(pidsToStop)
    }
    catch (e) {
        console.log(e)
    }

    console.log('stop playing')
}
