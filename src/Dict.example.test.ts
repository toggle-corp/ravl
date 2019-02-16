import { isNotDefined, typeOf } from '@togglecorp/fujs';

import RavlError from './RavlError';
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
            wards: { type: 'array.companyName', required: true },
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
            if (isNotDefined(self.description)) {
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
];

newEntries.forEach((entry) => {
    dict.put(entry.doc.name, entry);
});

test('schema of companyName', () => {
    expect(dict.getExample('companyName', 1, false)).toEqual('apple');
});

test('schema of district', () => {
    expect(dict.getExample('district', 1, false)).toEqual({
        id: 1,
        index: 1,
        name: 'ram',
        description: 'ram',
        officerAssigned: { id: 1, name: 'ram', wards: ['apple'] },
    });
});

test('schema of officer', () => {
    expect(dict.getExample('officer', 1, false)).toEqual({
        id: 1,
        name: 'ram',
        wards: ['apple'],
    });
});

test('inline schema', () => {
    const schema = {
        doc: {
            name: 'officer',
            description: 'District Officer',
        },
        fields: {
            id: { type: 'uint', required: true },
            name: { type: 'string', required: false },
            age: { arrayType: 'int', required: true },
        },
    };
    const value = {
        id: 1,
        name: 'ram',
        age: [1],
    };
    expect(dict.getExample(schema, 1, false)).toEqual(value);
});
