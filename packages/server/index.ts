const fastify = require("fastify")({ logger: true })

export const listen = async function (port, fookie) {
    fastify.post("/", async (request, reply) => {
        return await fookie.run(request.body)
    })

    try {
        await fastify.listen({ port: port })
    } catch (err) {
        fastify.log.error(err)
        process.exit(1)
    }
}
