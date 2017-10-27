const { RavlError } = require('./error');
const { isFalsy, getRandomFromList } = require('./common');

const ARRAY_SUFFIXED = 'array.';

const attachExampleGenerator = (container) => {
    const getExample = (type) => {
        // If type starts with 'array.'
        if (type.startsWith(ARRAY_SUFFIXED)) {
            const subType = type.substring(ARRAY_SUFFIXED.length, type.length);
            const opArray = [];
            const count = Math.floor(Math.random() * 10);
            for (let i = 0; i < count; i += 1) {
                opArray.push(getExample(subType));
            }
            return opArray;
        }

        // Else if
        const schema = container.get(type);
        if (isFalsy(schema)) {
            throw new RavlError(`'${type}' type is not defined`);
        }

        if (isFalsy(schema.fields)) {
            // this means this is a basic type
            // TODO: check for doc to exits
            return getRandomFromList(schema.doc.example);
        }

        const doc = {};
        Object.keys(schema.fields).forEach((fieldName) => {
            const field = schema.fields[fieldName];
            if (!isFalsy(field.required) || Math.random() > 0.1) {
                const valueForField = getExample(field.type);
                doc[fieldName] = valueForField;
            }
        });


        return doc;
    };
    container.getExample = getExample; // eslint-disable-line
};

module.exports = attachExampleGenerator;
