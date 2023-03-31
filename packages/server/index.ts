import fastify from "fastify"

const f = fastify()

export const listen = async function (port, fookie) {
    f.post("/", async (request) => {
        return await fookie.run(request.body)
    })

    try {
        await f.listen({ port: port })
    } catch (err) {
        process.exit(1)
    }
}
