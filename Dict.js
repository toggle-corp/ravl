const { isTruthy } = require('./common');

class Dict {
    constructor() {
        this.map = {};
    }

    get(type) {
        const subtypes = type.split(':');
        let merger = {};
        subtypes.forEach((subtype) => {
            const val = this.map[subtype];
            if (isTruthy(val)) {
                merger = {
                    doc: { ...merger.doc, ...val.doc },
                    fields: { ...merger.fields, ...val.fields },
                    validator: val.validator || merger.validator,
                };
            }
        });
        // set merger.fields to undefined if it is empty
        // NOTE: Other code check if it if undefined or not
        if (Object.keys(merger.fields).length === 0) {
            merger.fields = undefined;
        }
        return merger;
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
