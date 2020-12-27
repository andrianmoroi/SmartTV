import { exec, execSync } from 'child_process';
import express from 'express';
import { RedisContext } from './RedisContext';
import { WebSocketManager } from './WebSocketManager';
import { PlayerManager } from './PlayerManager';
import { PlayerDBus } from './PlayerDBus';

let port = process.env.PORT || 3000
let wssPort = 7878
let app: express.Application = express()
let redis = new RedisContext("localhost", 6379)
let wss = new WebSocketManager(wssPort)
let playerManager = new PlayerManager()
let pdbus = new PlayerDBus()

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

app.post("/api/togglePlay", async (req, res) => {
    try {

        await pdbus.togglePlay(() => { })
            .catch(ex => { console.log(`TogglePlay exception: ${ex}`) });
    }
    catch (e) {
        console.log(e)
    }

    res.sendStatus(200)
})

app.post("/api/mute", async (req, res) => {
    try {
        await pdbus.mute(() => { })
            .catch(ex => { console.log(`Mute exception: ${ex}`) });
    }
    catch (e) {
        console.log(e)
    }

    res.sendStatus(200)
})

app.post("/api/unmute", async (req, res) => {
    try {
        await pdbus.unmute(() => { })
            .catch(ex => { console.log(`Unmute exception: ${ex}`) });
    }
    catch (e) {
        console.log(e)
    }

    res.sendStatus(200)
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

app.post("/api/play", (req, res) => {

    let name = req.body.name;
    let url = req.body.url;

    var play = playerManager.play(url)

    res.sendStatus(play ? 200 : 500)
})

app.post("/api/playLoop", (req, res) => {

    let name = req.body.name;
    let url = req.body.url;

    var play = playerManager.play(url)

    res.sendStatus(play ? 200 : 500)
})

app.post("/api/stop", (req, res) => {

    playerManager.stopPlayingVideo()

    wss.sendMessage(`Nothing is playing now...`)

    res.sendStatus(200)
})

app.listen(port, () => {
    console.log("listen to port " + port)
})