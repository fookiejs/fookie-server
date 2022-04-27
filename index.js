const fastify = require("fastify")({
    logger: process.env.DEBUG || false
})
module.exports = async function (ctx) {
    fastify.post("/", async (req, res) => {
        let payload = req.body;
        if (typeof payload.token == "boolean") return false;
        if (!payload.token && req.headers.token) payload.token = req.headers.token;
        await ctx.run(payload);
        res.send(payload.response)
    })

    fastify.get("/health_check", (req, res) => {
        res.send({ ok: true })
    })

    ctx.listen = function (port) {
        fastify.listen(port, '0.0.0.0')
    }
}