const { RavlError } = require('./error');
const { isFalsy, typeOf } = require('./common');
const dict = require('./schema');
const attachValidator = require('./attachValidator');

attachValidator(dict);

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
            wards: { type: 'array.companyName' },
        },
    };
    dict.put(name, schema);
}


test('should be valid', () => {
    expect(
        () => dict.validate('hari', 'string'),
    ).not.toThrow();
    expect(
        () => dict.validate(false, 'boolean'),
    ).not.toThrow();
    expect(
        () => dict.validate(12121, 'number'),
    ).not.toThrow();
    expect(
        () => dict.validate(12121.021, 'number'),
    ).not.toThrow();
    expect(
        () => dict.validate(-12121.021, 'number'),
    ).not.toThrow();
    expect(
        () => dict.validate([[[1, 2]]], 'array'),
    ).not.toThrow();
    expect(
        () => dict.validate([[[1, 2]]], 'array.array'),
    ).not.toThrow();
    expect(
        () => dict.validate([[[1, 2]]], 'array.array.array'),
    ).not.toThrow();
    expect(
        () => dict.validate([[[1, 2]]], 'array.array.array.number'),
    ).not.toThrow();
    expect(
        () => dict.validate(-1, 'int'),
    ).not.toThrow();
    expect(
        () => dict.validate(1, 'uint'),
    ).not.toThrow();
    expect(
        () => dict.validate('shyam@gmail.com', 'email'),
    ).not.toThrow();
    expect(
        () => dict.validate({ id: 12, name: 'kaski', description: 'Best district' }, 'district'),
    ).not.toThrow();
    expect(
        () => dict.validate({ id: 12, name: 'kaski', description: 'Best district' }, 'district'),
    ).not.toThrow();
    expect(
        () => dict.validate({ id: 2, name: 'kaski', wards: ['hari', 'shyam'] }, 'officer'),
    ).not.toThrow();
    expect(
        () => dict.validate({ id: 2, name: 'kaski', wards: ['hari', 'shyam'], extra: 'field' }, 'officer'),
    ).not.toThrow();
});

test('should not be valid', () => {
    expect(
        () => dict.validate('hari', null),
    ).toThrow();
    expect(
        () => dict.validate({ id: null, name: 'kaski', description: 'Best district' }, 'district'),
    ).toThrow();
    expect(
        () => dict.validate('hari', 'non-existent-type'),
    ).toThrow();
    expect(
        () => dict.validate({ id: 2, name: 'kaski', wards: [undefined] }, 'officer'),
    ).toThrow();
    /*
    BUG:
    expect(
        () => dict.validate({ id: 2, name: 'kaski', wards: undefined }, 'officer'),
    ).toThrow();
    */

    expect(
        () => dict.validate(undefined, 'array.string'),
    ).toThrow();
});

test('should work', () => {
    {
        const name = 'dbentity';
        const schema = {
            doc: {
                name: 'Database Entity',
                description: 'Defines all the attributes common to db entities',
            },
            fields: {
                createdAt: { type: 'string', required: true }, // date
                createdBy: { type: 'uint' },
                createdByName: { type: 'string' },
                id: { type: 'uint', required: true },
                modifiedAt: { type: 'string', required: true }, // date
                modifiedBy: { type: 'uint' },
                modifiedByName: { type: 'string' },
                versionId: { type: 'uint', required: true },
            },
        };
        dict.put(name, schema);
    }
    {
        const name = 'galleryFile';
        const schema = {
            doc: {
                name: 'Gallery file',
                description: 'Standard gallery file',
            },
            extends: 'dbentity',
            fields: {
                file: { type: 'string', required: true }, // url
                isPublic: { type: 'boolean' },
                metaData: { type: 'object' },
                mimeType: { type: 'string' }, // mime
                permittedUserGroups: { type: 'array.uint' },
                permittedUsers: { type: 'array.uint' },
                title: { type: 'string', required: true },
            },
        };
        dict.put(name, schema);
    }

    const obj = {
        createdAt: '2018-01-10T07:14:18.150751Z',
        createdBy: 4,
        createdByName: 'Navin',
        file: 'http://localhost:8000/media/gallery/unsupervised_ANN.pdf',
        id: 1245,
        isPublic: true,
        metaData: null,
        mimeType: 'application/pdf',
        modifiedAt: '2018-01-10T07:14:18.155046Z',
        modifiedBy: 4,
        modifiedByName: 'Navin',
        permittedUserGroups: [],
        permittedUsers: [4],
        title: 'unsupervised ANN.pdf',
        versionId: 1,
    };

    dict.validate(obj, 'galleryFile');
});
