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
                    fields: val.fields || merger.fields,
                    validator: val.validator || merger.validator,
                };
            }
        });
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
