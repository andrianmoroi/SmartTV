import * as bodyParser from "body-parser";
import { exec, execSync } from 'child_process';
import express from 'express';

let port = 3000
let app: express.Application = express()
let router = express.Router()

app.use(express.json());
// app.use(bodyParser.json())
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

    exec(runCommand, (error, response) => {
        console.log(error);
        console.log(response);
    });

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
    let pidsToStop = "ps -aux | egrep \"[t]ools/player\.py|[s]treamlink|[o]mxplayer\" | grep -Po \"pi *?\\d+\" | grep -Po \"\\d+\" | xargs --no-run-if-empty kill";

    execSync(pidsToStop)

    console.log('stop playing')
}
