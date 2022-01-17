module.exports = function (ctx) {
    const { Sequelize, DataTypes, Model } = require('sequelize');
    const sequelize = null
    ctx.database({
        name: "sequelize",
        types: {},
        pk: "id",
        connect: async function (config) {
            this.sequelize = new Sequelize(...config)
            await this.sequelize.authenticate();
        },
        disconnect: async function (config) {
            console.log("sequelize dc");
        },
        modify: async function (model) {
            let db = ctx.local.get("database", "sequelize")
            let settings = ctx.local.get("setting", db.name + "_connection")
            console.log(db);
            await db.connect(settings.value)


            class MDL extends Model { }
            MDL.init(model.schema, {

                sequelize,
                modelName: model.name
            });

            model.methods.set("read", async function (payload, ctx, state) {
                let res = await Model.find({
                    where: payload.query,
                    attributes: payload.attributes,
                    limit: payload.options.limit,
                    offset: payload.options.offset,
                });
                return res;
            });
            model.methods.set("create", async function (payload, ctx, state) {
                let res = await Model.create(payload.body);
                return ctx.lodash.pick(res, payload.attributes)
            });
            model.methods.set("delete", async function (payload, ctx, state) {
                let res = await Model.destroy({
                    where: payload.query
                });
                return res;
            });
            model.methods.set("update", async function (payload, ctx, state) {
                return await Model.update(payload.body, {
                    where: payload.query
                });
            });

            model.methods.set("count", async function (payload, ctx, state) {
                let res = await Model.count({
                    where: payload.query
                });
                return res;
            });
        }
    })
}