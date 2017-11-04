const { isTruthy, isFalsy, typeOf } = require('./common');
const { RavlError } = require('./error');

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
        if (isFalsy(schema) || typeOf(schema) !== 'object') {
            throw RavlError('Schema is not valid');
        }
        if (isTruthy(schema.extends) && typeOf(schema.extends) !== 'string') {
            throw RavlError('Schema:extends is not valid');
        }
        if (isTruthy(schema.doc) && typeOf(schema.doc) !== 'object') {
            throw RavlError('Schema:doc is not valid');
        }
        if (isTruthy(schema.fields) && typeOf(schema.fields) !== 'object') {
            throw RavlError('Schema:fields is not valid');
        }
        if (isTruthy(schema.validator) && typeOf(schema.validator) !== 'function') {
            throw RavlError('Schema:validator is not valid');
        }

        this.map[type] = schema;
    }
}

module.exports.default = Dict;
