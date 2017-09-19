// ERRORS
const { RavlError } = require('./error');
const { isFalsy, typeOf } = require('./common');
const { dict } = require('./schema');

// Adding user defined schema
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
            wards: { type: 'array.string:dev', required: true },
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
const elems = [
    { type: 'int', level: 1, example: true },
    { type: 'uint', level: 1, example: true },
    { type: 'email', level: 1, example: true },
    { type: 'district', level: 2 },
    { type: 'officer', level: 3 },
];
let op = '';
elems.forEach((elem) => {
    const schema = dict.get(elem.type);
    const schemaEx = dict.getSchema(elem.type);
    const schemaEg = JSON.stringify(dict.getExample(elem.type), null, 2);

    if (schema && schema.doc) {
        // Title
        op += `${'#'.repeat(elem.level)} ${schema.doc.name}\n`;
        // Description
        if (schema.doc.description) {
            op += `${schema.doc.description}\n`;
        }
        // Formatted Schema
        if (schemaEx) {
            op += `###### Schema\n\`\`\`javascript\n${schemaEx}\n\`\`\`\n`;
        }
        // Dynamic examples
        if (schemaEg) {
            op += `###### Example\n\`\`\`javascript\n${schemaEg}\n\`\`\`\n`;
        }
        /*
        // Static examples
      const surroundBacktick = a => `\`${a}\``;
      if (elem.example && schema.doc.example) {
        console.log(`Example: ${schema.doc.example.map(surroundBacktick).join(', ')}`);
      }
      */
        // Note
        if (schema.doc.note) {
            op += `> ${schema.doc.note}\n`;
        }
        op += '\n';
    } else {
        // for arrays
    }
});
console.log(op);
