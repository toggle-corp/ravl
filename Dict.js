const { isTruthy } = require('./common');

const isEmptyObject = obj => (Object.keys(obj).length === 0);

class Dict {
    constructor() {
        this.map = {};
    }

    get(type) {
        let result = this.map[type];
        if (result.extends) {
            const subResult = this.get(result.extends);
            result = {
                // TODO: may be this is opposite
                doc: { ...subResult.doc, ...result.doc },
                fields: { ...subResult.fields, ...result.fields },
                validator: result.validator || subResult.validator,
            };
        }
        // set fields to undefined if it is an empty object
        // Other code check if it if undefined or not
        if (result.fields && isEmptyObject(result.fields)) {
            result.fields = undefined;
        }
        return result;
    }

    has(type) {
        return isTruthy(this.map[type]);
    }

    put(type, schema) {
        if (this.has(type)) {
            console.warn('Overriding an existing key');
        }
        this.map[type] = schema;
    }
}

module.exports.default = Dict;
