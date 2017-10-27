const { isTruthy, isFalsy } = require('./common');

const isEmptyObject = obj => (Object.keys(obj).length === 0);

class Dict {
    constructor() {
        this.map = {};
    }

    get(type) {
        let result = this.map[type];
        if (!this.has(type)) {
            // console.warn(`RAVL.Dict: key '${type}' not found`);
            return undefined;
        }
        if (result.extends) {
            const subResult = this.get(result.extends);
            if (isFalsy(subResult)) {
                return undefined;
            }
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
            console.warn(`RAVL.Dict: Overriding schema for key '${type}'`);
        }
        this.map[type] = schema;
    }
}

module.exports.default = Dict;
