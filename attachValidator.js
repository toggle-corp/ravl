const { RavlError } = require('./error');
const { isTruthy, isFalsy } = require('./common');

const ARRAY = 'array';
const ARRAY_SUFFIXED = 'array.';

const attachValidator = (container) => {
    const validate = (object, type, context = type) => {
        if (isFalsy(type)) {
            throw new RavlError(`'${type}' type is not defined`, context);
        }
        // NOTE: If type starts with 'array.'
        if (type.startsWith(ARRAY_SUFFIXED)) {
            // NOTE: Lists are always required
            if (isFalsy(object)) {
                throw new RavlError(`Value must be of type ${ARRAY}`, context);
            }
            // Validate as array
            validate(object, ARRAY, context);
            // Get type of children ie: string after 'array.'
            const subType = type.substring(ARRAY_SUFFIXED.length, type.length);
            // Iterate over the elements of array and validate them
            object.forEach((subObject) => {
                validate(subObject, subType, `${context} > ${ARRAY}`);
            });
        } else {
            // Get schema
            const schema = container.get(type);
            if (isFalsy(schema)) {
                throw new RavlError(`Schema for type '${type}' is not defined`, context);
            }
            // Iterate over fields and validate them
            if (isTruthy(schema.fields)) {
                // iterate over fields and validate
                Object.keys(schema.fields).forEach((fieldName) => {
                    const field = schema.fields[fieldName];
                    const subObject = object[fieldName];
                    const isSubObjectFalsy = isFalsy(subObject);
                    if (isSubObjectFalsy && field.required) {
                        throw new RavlError(`Field '${fieldName}' is required`, context);
                    } else if (!isSubObjectFalsy) {
                        validate(subObject, field.type, `${context} > ${fieldName}`);
                    }
                });
            }
            // Run validation function on the object
            if (isTruthy(schema.validator)) {
                // run validation hook
                schema.validator(object, context);
            }
            // Check for fields that shouldn't be present
            if (isTruthy(schema.fields)) {
                const fieldsInObject = isTruthy(object) ? Object.keys(object) : [];
                const extraFields = fieldsInObject.filter(x => isFalsy(schema.fields[x]));
                if (extraFields.length > 0) {
                    // throw new RavlError(`Extra field(s) present: '${extraFields}'`, context);
                    console.warn(`RAVL: Extra field(s) present: '${extraFields}'`, context);
                }
            }
        }
    };
    container.validate = validate; // eslint-disable-line
};

module.exports = attachValidator;
