import RavlError from './RavlError';
import { isFalsy, typeOf } from './utils';
import Dict, { Schema } from './Dict';
import entries from './entries';

const dict = new Dict();

const newEntries: Schema[] = [
    ...entries,
    {
        doc: {
            name: 'companyName',
            description: 'Company Name',
            example: ['apple', 'microsoft', 'google', 'amazon'],
        },
        extends: 'string',
    },
    {
        doc: {
            name: 'officer',
            description: 'District Officer',
        },
        fields: {
            id: { type: 'uint', required: true },
            name: { type: 'string', required: false },
            wards: { type: 'array.companyName' },
        },
    },
    {
        doc: {
            name: 'district',
            description: 'Discrict',
            note: 'A district can be assigned with one more officer if required.',
        },
        fields: {
            id: { type: 'uint', required: true },
            index: { type: 'number', required: false },
            name: { type: 'string', required: true },
            description: { type: 'string', required: false },
            officerAssigned: { type: 'officer', required: false },
        },
        validator: (self: { description?: any }, context: string) => {
            if (isFalsy(self.description)) {
                return;
            }
            if (typeOf(self.description) !== 'string') {
                throw new RavlError('Value must be of type \'string\'', context);
            }
            if (self.description.length <= 5) {
                throw new RavlError('Length must be greater than 5', context);
            }
        },
    },
    {
        doc: {
            name: 'dbentity',
            description: 'Database Entity',
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
    },
    {
        doc: {
            name: 'galleryFile',
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
            '*': { type: 'boolean', required: true },
        },
    }
];

newEntries.forEach((entry) => {
    dict.put(entry.doc.name, entry);
});

test('should be valid', () => {
    expect(() => {
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
        dict.validate(
            { id: 12, name: 'kaski', description: 'Best district' },
            'district',
        );
        dict.validate(
            { id: 12, name: 'kaski', description: 'Best district' },
            'district',
        );
        dict.validate(
            { id: 2, name: 'kaski', wards: ['hari', 'shyam'] },
            'officer',
        );
        dict.validate(
            { id: 2, name: 'kaski', wards: ['hari', 'shyam'], extra: 'this-is-extra' },
            'officer',
        );
        dict.validate(
            { id: 2, name: 'kaski', wards: undefined },
            'officer',
        );
        dict.validate(
            {
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

                anything: false,
                anythingElse: true,
            },
            'galleryFile',
        );
    }).not.toThrow();
});

test('should be invalid', () => {
    expect(() => {
        dict.validate(undefined, 'string');
    }).toThrow(RavlError);
    expect(() => {
        dict.validate(undefined, 'array.string');
    }).toThrow(RavlError);
    expect(() => {
        dict.validate('hari', 'non-existent-type');
    }).toThrow(RavlError);
    expect(() => {
        dict.validate(
            { id: null, name: 'kaski', description: 'Best district' },
            'district',
        );
    }).toThrow(RavlError);
    expect(() => {
        dict.validate(
            { id: 2, name: 'kaski', wards: [undefined] },
            'officer',
        );
    }).toThrow(RavlError);
    expect(() => {
        dict.validate(
            {
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

                anything: false,
                anythingElse: 'sneaky string',
            },
            'galleryFile',
        );
    }).toThrow(RavlError);
});
