import { exec, execSync } from 'child_process';
import express from 'express';
import { RedisContext } from './RedisContext';

let port = process.env.PORT || 3000
let app: express.Application = express()
let redis = new RedisContext("localhost", 6379)

redis.get("a").then(m => console.log(m))
redis.set("b", "world")

app.use(express.json());
app.use(express.static('public'))

app.get("/api/test", (req, res) => {
    res.send("Hello world")
})

app.get("/api/getAllChannels", (req, res) => {
    res.sendFile(`${process.cwd()}/sources/channels.json`)
})

app.post("/api/start", (req, res) => {
    stopPlayingVideo();

    let url = req.body.url;
    let runCommand = `python3 tools/player.py \"${url}\"`;

    try {
        exec(runCommand, (error, response) => {
            console.log(error);
            console.log(response);
        })
    }
    catch (e) {
        console.log(e);
    }

    res.sendStatus(200)
})

app.post("/api/stop", (req, res) => {
    stopPlayingVideo();

    res.sendStatus(200)
})

app.listen(port, () => {
    console.log("listen to port " + port)
})

function stopPlayingVideo() {
    let pidsToStop = "ps -aux | egrep \"[t]ools/player\.py|[s]treamlink|[o]mxplayer\" | grep -Po \"^[a-zA-Z0-9]+ *?\\d+\" | grep -Po \"\\d+\" | xargs --no-run-if-empty kill";

    try {
        execSync(pidsToStop)
    }
    catch (e) {
        console.log(e)
    }

    console.log('stop playing')
}
