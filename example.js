// ERRORS
const { RavlError } = require('./error');
const { isFalsy, typeOf } = require('./common');
const dict = require('./schema');
const attachValidator = require('./attachValidator');
const attachExampleGenerator = require('./attachExampleGenerator');
const attachSchemaGenerator = require('./attachSchemaGenerator');
const generateDoc = require('./generateDoc');

// ATTACHING BEHAVIORS
attachValidator(dict);
attachExampleGenerator(dict);
attachSchemaGenerator(dict);

// ATTACHING USER DEFINED SCHEMAS
{
    const type = 'companyName';
    const schema = {
        doc: {
            name: 'Company names',
            description: 'Loads validator from string',
            example: ['apple', 'microsoft', 'google', 'amazon'],
        },
        extends: 'string',
    };
    dict.put(type, schema);
}
{
    const name = 'district';
    const schema = {
        doc: {
            name: 'District',
            description: 'User type containing information related  a district.',
            note: 'A district can be assigned with one more officer if required.',
        },
        fields: {
            id: { type: 'uint', required: true },
            index: { type: 'number', required: false },
            name: { type: 'string', required: true },
            description: { type: 'string', required: false },
            officerAssigned: { type: 'officer', required: false },
        },
        validator: (self, context) => {
            if (isFalsy(self.description)) {
                return;
            }
            if (!typeOf(self.description) === 'string') {
                throw new RavlError('Value must be of type \'string\'', context);
            }
            if (self.description.length <= 5) {
                throw new RavlError('Length must be greater than 5', context);
            }
        },
    };
    dict.put(name, schema);
}
{
    const name = 'officer';
    const schema = {
        doc: {
            name: 'District Officer',
            description: 'User type containing information related an officer.',
        },
        fields: {
            id: { type: 'uint', required: true },
            name: { type: 'string', required: false },
            wards: { type: 'array.companyName', required: true },
        },
    };
    dict.put(name, schema);
}

// VALIDATION EXAMPLE
try {
    dict.validate('hari', 'string');
    dict.validate(false, 'boolean');
    dict.validate(12121, 'number');
    dict.validate(12121.021, 'number');
    dict.validate(-12121.021, 'number');
    dict.validate([[[1, 2]]], 'array');
    dict.validate([[[1, 2]]], 'array.array');
    dict.validate([[[1, 2]]], 'array.array.array');
    dict.validate([[[1, 2]]], 'array.array.array.number');
    dict.validate(-1, 'int');
    dict.validate(1, 'uint');
    dict.validate('shyam@gmail.com', 'email');
    dict.validate({ id: 12, name: 'kaski', description: 'Best district' }, 'district');
    dict.validate({ id: 12, name: 'kaski', description: 'Best district' }, 'district');
    dict.validate({ id: 2, name: 'kaski', wards: ['hari', 'shyam'] }, 'officer');
} catch (ex) {
    if (ex instanceof RavlError) {
        console.log(ex.message);
    } else {
        throw ex;
    }
}

// FORMATTED_SCHEMA & INSTANCE EXAMPLE

// we can have 5 levels
const entries = [
    { type: 'int', level: 1, example: true },
    { type: 'uint', level: 1, example: true },
    { type: 'email', level: 1, example: true },
    { type: 'district', level: 2 },
    { type: 'companyName', level: 2 },
    { type: 'officer', level: 3, example: true },
];

const doc = generateDoc(dict, entries);
console.log(doc);
