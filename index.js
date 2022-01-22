const fastify = require("fastify")({
    logger: false
})

module.exports = async function (ctx) {
    fastify.post("/", async (req, res) => {
        try {
            let payload = req.body;
            if (payload.user || typeof payload.system == "boolean") return false;
            if (!payload.token && req.headers.token) payload.token = req.headers.token;
            await ctx.run(payload);
            res.send(payload.response)
        } catch (error) {
            console.log(error);
        }

    })

    fastify.get("/health_check", (req, res) => {
        res.status(200).json({ ok: true })
    })

    ctx.listen = function (port) {
        fastify.listen(port)
    }


    await ctx.use(require('./src/database/mongodb.js'));
    await ctx.use(require('./src/database/sql.js'));
    await ctx.use(require('./src/database/dynomodb.js'));
    await ctx.use(require('./src/database/cassandra.js'));
}






