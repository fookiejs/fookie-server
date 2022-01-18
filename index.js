const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

module.exports = async function (ctx) {

    ctx.routines = new Map()
    ctx.routine = async function (name, time, func) {
        let routine = setInterval(() => {
            func(ctx);
        }, time);
        this.routines.set(name, routine);
    }
    ctx.app = express();
    ctx.app.use(cors());
    ctx.app.use(bodyParser.urlencoded({ extended: true }));
    ctx.app.use(bodyParser.json());
    ctx.app.post("/", async (req, res) => {
        try {
            let payload = req.body;
            if (payload.user || typeof payload.system == "boolean") return false;
            if (!payload.token && req.headers.token) payload.token = req.headers.token;
            await ctx.run(payload);
            res.status(200).json(payload.response);
        } catch (error) {
            console.log(error);
        }

    })

    ctx.app.get("/health_check", (req, res) => {
        res.status(200).json({ ok: true })
    })

    ctx.listen = function (port) {
        this.app.listen(port, () => {
            console.log(`FOOKIE ${port} is listening...`);
        });
    }

    await ctx.use(require('./src/database/mongodb.js'));
    await ctx.use(require('./src/database/sql.js'));
    await ctx.use(require('./src/database/dynomodb.js'));
    await ctx.use(require('./src/database/cassandra.js'));
}






