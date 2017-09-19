const { RavlError } = require('./error');
const { isFalsy } = require('./common');

const TAB = '    ';
const ARRAY_SUFFIXED = 'array.';

const attachSchemaGenerator = (container) => {
    const getSchema = (type, level = 0) => {
        const tabLevel = TAB.repeat(level);
        const tabLevel1 = TAB.repeat(level + 1);

        // If type starts with 'array.'
        if (type.startsWith(ARRAY_SUFFIXED)) {
            const subType = type.substring(ARRAY_SUFFIXED.length, type.length);
            let schemaForSubType = getSchema(subType, level + 1);
            if (isFalsy(schemaForSubType)) {
                schemaForSubType = `${tabLevel1}'${subType}',`;
            }
            return `${tabLevel}[\n${schemaForSubType}\n${tabLevel}]`;
        }

        // Else if
        const schema = container.get(type);
        if (isFalsy(schema)) {
            throw new RavlError('Type is not defined');
        }
        if (isFalsy(schema.fields)) {
            return undefined;
        }

        let doc = `${tabLevel}{`;
        Object.keys(schema.fields).forEach((fieldName) => {
            const field = schema.fields[fieldName];
            let schemaForField = getSchema(field.type, level + 1);
            if (isFalsy(schemaForField)) {
                schemaForField = ` '${field.type}'`;
            } else {
                schemaForField = `\n${schemaForField}`;
            }
            doc += `\n${tabLevel1}${fieldName}:${schemaForField},${field.required ? '    // required' : ''}`;
        });
        return `${doc}\n${tabLevel}}`;
    };
    container.getSchema = getSchema; // eslint-disable-line
};

module.exports = attachSchemaGenerator;
