import f from "fastify"

const fastify = f()

export const listen = async function (port, fookie) {
    console.log("Server is running on port:", port)
    fastify.post("/", async (request) => {
        return await fookie.run(request.body)
    })

    try {
        await fastify.listen({ port: port })
    } catch (err) {
        process.exit(1)
    }
}
