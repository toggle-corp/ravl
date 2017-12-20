const { RavlError } = require('./error');
const { isFalsy, typeOf } = require('./common');
const dictionary = require('./schema');
const attachExampleGenerator = require('./attachExampleGenerator');
const attachSchemaGenerator = require('./attachSchemaGenerator');
const generateDoc = require('./generateDoc');

// ATTACHING BEHAVIORS
attachExampleGenerator(dictionary, 1, false);
attachSchemaGenerator(dictionary);

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
    dictionary.put(type, schema);
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
    dictionary.put(name, schema);
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
    dictionary.put(name, schema);
}

// FORMATTED_SCHEMA & INSTANCE EXAMPLE
const entries = [
    { type: 'int', level: 1, example: true },
    { type: 'uint', level: 1, example: true },
    { type: 'email', level: 1, example: true },
    { type: 'district', level: 2 },
    { type: 'companyName', level: 2 },
    { type: 'officer', level: 3, example: true },
];

test('should create markdown', () => {
    const op = generateDoc(dictionary, entries);
    const ex = `# Integer
Basic type which denotes a number without decimal parts.
###### Example
\`\`\`javascript
1
\`\`\`

# Unsigned Integer
Basic type which denotes a positive integer.
###### Example
\`\`\`javascript
1
\`\`\`

# Email
Basic type which denotes a valid email.
###### Example
\`\`\`javascript
"johndoe@email.com"
\`\`\`

## District
User type containing information related  a district.
###### Schema
\`\`\`javascript
{
    id: 'uint',    // required
    index: 'number',
    name: 'string',    // required
    description: 'string',
    officerAssigned:
    {
        id: 'uint',    // required
        name: 'string',
        wards:
        [
            'companyName',
        ],    // required
    },
}
\`\`\`
> A district can be assigned with one more officer if required.

## Company names
Loads validator from string

### District Officer
User type containing information related an officer.
###### Schema
\`\`\`javascript
{
    id: 'uint',    // required
    name: 'string',
    wards:
    [
        'companyName',
    ],    // required
}
\`\`\`
###### Example
\`\`\`javascript
{
  "id": 1,
  "name": "ram",
  "wards": [
    "apple"
  ]
}
\`\`\`

`;
    expect(op).toEqual(ex);
});
