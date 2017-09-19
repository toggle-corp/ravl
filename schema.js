const { RavlError } = require('./error');
const Dict = require('./Dict').default;
const attachValidator = require('./attachValidator').default;
const attachExampleGenerator = require('./attachExampleGenerator').default;
const attachSchemaGenerator = require('./attachSchemaGenerator').default;
const {
    basicTypes,
    typeOf,
    isValidEmail,
    isValidInteger,
} = require('./common');

const dict = new Dict();
attachValidator(dict);
attachExampleGenerator(dict);
attachSchemaGenerator(dict);

const examples = {
    // 'Function',
    // 'Array',
    // 'Date',
    // 'RegExp',
    // 'Object',
    // 'Error',
    // 'Symbol',
    boolean: [
        true, false,
    ],
    number: [
        1, 3, 4, 5, 6, 0, -1, -2, -3, -4, -10, -11, -10.12, 11.2121, 1298.432,
        432.342, -23819.12, 3213, 23.21,
    ],
    string: [
        'ram', 'shyam', 'hari', 'home', 'city', 'long text', 'ankit',
        'placeholder',
    ],
    email: [
        'johndoe@email.com', 'hariprasad@emailer.com', 'frozenhelium@toggle.com',
        'doe.john@email.com', 'ramprasad1212@emailer.com', 'fruity1994@toggle.com',
    ],
    int: [
        1, 2, 10, -12, 11, 0,
        -3, 6, 7, -15, 14, -7,
    ],
    uint: [
        1, 2, 10, 11, 0,
        6, 7, 16, 13, 5,
    ],
    dev: [
        'apple', 'microsoft', 'google',
    ],
};

// Add schema for basic type
{
    const createValidator = type => (self, context) => {
        const identifiedType = typeOf(self);
        if (identifiedType !== type) {
            throw new RavlError(401, `Value must be of type '${type}'`, context);
        }
    };
    // Add schemas for all basic types
    basicTypes.forEach((basicType) => {
        const type = basicType.toLowerCase();
        const validator = createValidator(type);
        const schema = {
            doc: {
                name: basicType,
                description: `Basic type representing ${type}`,
                example: examples[type],
            },
            validator,
        };
        dict.put(type, schema);
    });
}
// Add schema for email
{
    const type = 'email';
    const schema = {
        doc: {
            name: 'Email',
            description: 'Basic type which denotes a valid email.',
            example: examples.email,
        },
        validator: (self, context) => {
            if (!isValidEmail(self)) {
                throw new RavlError(401, 'Value is not a valid email', context);
            }
        },
    };
    dict.put(type, schema);
}
// Add schema for int
{
    const type = 'int';
    const schema = {
        doc: {
            name: 'Integer',
            description: 'Basic type which denotes a number without decimal parts.',
            example: examples.int,
        },
        validator: (self, context) => {
            if (!isValidInteger(self)) {
                throw new RavlError(401, 'Value is not a valid integer', context);
            }
        },
    };
    dict.put(type, schema);
}
// Add schema for uint
{
    const type = 'uint';
    const schema = {
        doc: {
            name: 'Unsigned Integer',
            description: 'Basic type which denotes a positive integer.',
            example: examples.uint,
        },
        validator: (self, context) => {
            if (!isValidInteger(self) || self < 0) {
                throw new RavlError(401, 'Value is not a valid unsigned integer', context);
            }
        },
    };
    dict.put(type, schema);
}
{
    const type = 'dev';
    const schema = {
        doc: {
            name: 'String for Dev',
            description: 'Loads validator from string',
            example: examples[type],
        },
    };
    dict.put(type, schema);
}

module.exports.dict = dict;
