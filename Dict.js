const { isEmptyObject, isTruthy, isFalsy, typeOf } = require('./common');
const { RavlError } = require('./error');

class Dict {
    constructor() {
        this.map = {};
    }

    get(type) {
        let result = this.map[type];
        if (!this.has(type)) {
            console.warn(`RAVL.Dict: key '${type}' not found`);
            return undefined;
        }
        if (result.extends) {
            let subResult = this.get(result.extends);
            if (isFalsy(subResult)) {
                console.warn(`RAVL.Dict: subtype '${result.extends}' not found`);
                subResult = {};
            }
            result = {
                doc: { ...subResult.doc, ...result.doc },
                fields: { ...subResult.fields, ...result.fields },
                validator: result.validator || subResult.validator,
            };
        }
        // set fields to undefined if it is an empty object
        // Other code checks if it if undefined or not
        if (result.fields && isEmptyObject(result.fields)) {
            result.fields = undefined;
        }
        return result;
    }

    has(type) {
        return isTruthy(this.map[type]);
    }

    put(type, schema) {
        if (isFalsy(type)) {
            throw RavlError('Schema must be given a type');
        } else if (isFalsy(schema) || typeOf(schema) !== 'object') {
            throw RavlError('Schema is not valid');
        } else if (isTruthy(schema.extends) && typeOf(schema.extends) !== 'string') {
            throw RavlError('Schema:extends is not valid');
        } else if (isTruthy(schema.doc) && typeOf(schema.doc) !== 'object') {
            throw RavlError('Schema:doc is not valid');
        } else if (isTruthy(schema.fields) && typeOf(schema.fields) !== 'object') {
            throw RavlError('Schema:fields is not valid');
        } else if (isTruthy(schema.validator) && typeOf(schema.validator) !== 'function') {
            throw RavlError('Schema:validator is not valid');
        } else if (this.has(type)) {
            console.warn(`RAVL.Dict: Overriding schema for key '${type}'`);
        }
        this.map[type] = schema;
    }
}

module.exports.default = Dict;
