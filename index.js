const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

module.exports = async function (ctx) {
    await ctx.run({
        system: true,
        model: "plugin",
        method: "create",
        body:{
            name:"fookie-server",
            description:"Fookie Server",
            priority:1,
            group:"core",
            install:async function(ctx){
                await ctx.run({
                    system: true,
                    model: "plugin",
                    method: "create",
                    body: {
                        name: "http_server",
                        group: "server",
                        priority: 2,
                        install: async function (ctx) {
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
            
            
                            ctx.listen = function (port) {
                                this.app.listen(port, () => {
                                    console.log(`FOOKIE ${port} is listening...`);
                                });
                            }
                        },
                        uninstall: async function (ctx) {
                            console.log("UNINSTALL HTTP_SERVER WOWASD. TODO");
                        },
                    },
                })
                await ctx.use(require('./src/database/mongodb.js'));
                await ctx.use(require('./src/database/sql.js'));
                await ctx.use(require('./src/database/dynomodb.js'));
                await ctx.use(require('./src/database/cassandra.js'));
            },
            uninstall:async function(ctx){
                console.log("UNINSTALL FOOKIE_SERVER");
            },
        }
    })

}