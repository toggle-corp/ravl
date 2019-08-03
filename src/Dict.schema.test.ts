import { isNotDefined, typeOf } from '@togglecorp/fujs';

import RavlError from './RavlError';
import Dict, { Schema } from './Dict';
import entries from './entries';

const dict = new Dict();

const newEntries: Schema[] = [
    ...entries,
    {
        name: 'ward',
        description: 'Ward',
        example: ['one', 'two'],
        fields: {
            name: { type: 'string', required: true },
        }
    },
    {
        name: 'companyName',
        description: 'Company Name',
        example: ['apple', 'microsoft', 'google', 'amazon'],
        extends: 'string',
    },
    {
        name: 'officer',
        description: 'District Officer',
        fields: {
            id: { type: 'uint', required: true },
            name: { type: 'string', required: false },
            wards: { type: 'array.companyName', required: true },
        },
    },
    {
        name: 'district',
        description: 'Discrict',
        note: 'A district can be assigned with one more officer if required.',
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
    dict.put(entry.name, entry);
});


test('schema of companyName', () => {
    expect(dict.getSchema('companyName')).toBeUndefined();
});

test('schema of district', () => {
    const district = `{
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
}`;
    expect(dict.getSchema('district')).toEqual(district);
});


test('schema of officer', () => {
    const officer = `{
    id: 'uint',    // required
    name: 'string',
    wards:
    [
        'companyName',
    ],    // required
}`;
    expect(dict.getSchema('officer')).toEqual(officer);
});

test('inline schema', () => {
    const schema = {
        name: 'officer',
        description: 'District Officer',
        fields: {
            id: { type: 'uint', required: true },
            name: { type: 'string', required: false },
            wards: { type: 'array.companyName', required: true },
            anotherWards: { arrayType: 'companyName', required: true },
            anotherAnotherWards: { arrayType: 'ward', required: true },
        },
    };
    const officer = `{
    id: 'uint',    // required
    name: 'string',
    wards:
    [
        'companyName',
    ],    // required
    anotherWards:
    [
        'companyName',
    ],    // required
    anotherAnotherWards:
    [
        {
            name: 'string',    // required
        }
    ],    // required
}`;
    expect(dict.getSchema(schema)).toEqual(officer);
});

test('inline schema', () => {
    const schema = {
        name: 'officer',
        description: 'District Officer',
        fields: {
            id: { type: 'uint', required: true },
            name: { type: 'string', required: false },
            anotherWards: {
                arrayType: {
                    name: 'ward',
                    description: 'Ward',
                    example: ['one', 'two'],
                    fields: {
                        name: { type: 'string', required: true },
                    }
                },
                required: true,
            },
        },
    };
    const officer = `{
    id: 'uint',    // required
    name: 'string',
    anotherWards:
    [
        {
            name: 'string',    // required
        }
    ],    // required
}`;
    expect(dict.getSchema(schema)).toEqual(officer);
});
