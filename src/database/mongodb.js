module.exports = async function (ctx) {
    const mongoose = require("mongoose")
    await ctx.database({
        name: "mongodb",
        pk: "_id",
        url: "",
        types: {
            any: {
                type: mongoose.Schema.Types.Mixed,
                controller: () => true
            },
            _id: {
                type: mongoose.Schema.Types.ObjectId,
                controller: ctx.lodash.isString
            },
            object: {
                type: mongoose.Schema.Types.Mixed,
                controller: ctx.lodash.isObject
            },
            string: {
                type: mongoose.Schema.Types.String,
                controller: ctx.lodash.isString
            },
            number: {
                type: mongoose.Schema.Types.Number,
                controller: ctx.lodash.isNumber
            },
            boolean: {
                type: mongoose.Schema.Types.Boolean,
                controller: ctx.lodash.isBoolean
            },
            array: {
                type: mongoose.Schema.Types.Array,
                controller: ctx.lodash.isArray
            },
        },
        connect: async function () {
            await mongoose.connect(...arguments);
        },
        disconnect: async function () {
            //await mongoose.disconnect();
        },
        modify: async function (model) {
            let schema = {};
            for (let f in model.schema) {
                schema[f] = {};
                if (typeof model.schema[f].relation == "string") {
                    model.schema[f].type = "_id";
                }
                if (!ctx.lodash.keys(this.types).includes(model.schema[f].type)) {
                    throw Error(`Invalid Type: ${model.schema[f].type} Model: ${model.name}`);
                }
                schema[f].type = this.types[model.schema[f].type].type;
            }
            let Model = mongoose.model(model.name, new mongoose.Schema(schema, { versionKey: false }));

            model.methods.set("read", async function (payload, ctx, state) {
                let res = await Model.find(payload.query, payload.attributes, payload.projection).lean();
                payload.response.data = res;
            });
            model.methods.set("create", async function (payload, ctx, state) {
                let res = await Model.create(payload.body);
                payload.response.data = ctx.lodash.pick(res, payload.attributes)
            });
            model.methods.set("delete", async function (payload, ctx, state) {
                let res = await Model.deleteMany(payload.query);
                payload.response.data = res;
            });
            model.methods.set("update", async function (payload, ctx, state) {
                payload.response.data = await Model.updateMany(payload.query, payload.body);
            });

            model.methods.set("count", async function (payload, ctx, state) {
                let res = await Model.countDocuments(payload.query);
                payload.response.data = res;
            });
        }
    })
}