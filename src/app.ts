import * as bodyParser from "body-parser";
import express from 'express';

let port = 3000
let app: express.Application = express()
let router = express.Router()

app.use(bodyParser.json())
app.use(express.static('public'))

app.get("/api/test", (req, res) => {
    res.send("Hello world")
})

app.listen(port, () => {
    console.log("listen to port " + port)
})
