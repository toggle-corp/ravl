const { isFalsy } = require('./common');
const { RavlError } = require('./error');
const Dict = require('./Dict').default;

test('should check Dict.has', () => {
    const dict = new Dict();

    dict.put('a', { extends: 'base32' });
    dict.put('a', { extends: 'base16' });
    expect(dict.has('a')).toBeTruthy();
    expect(dict.has('b')).toBeFalsy();
});

test('should check invalid puts', () => {
    const dict = new Dict();

    expect(() => dict.put(undefined, {})).toThrow();
    expect(() => dict.put('newType', undefined)).toThrow();
    expect(() => dict.put('newType', [])).toThrow();
    expect(() => dict.put('newType', { extends: ['name'] })).toThrow();
    expect(() => dict.put('newType', { doc: 12 })).toThrow();
    expect(() => dict.put('newType', { fields: ['field1'] })).toThrow();
    expect(() => dict.put('newType', { validator: true })).toThrow();
});

test('valid extends', () => {
    const dict = new Dict();

    const typeZero = 'something-here';
    const validatorZero = (self) => {
        if (isFalsy(self.description)) {
            throw new RavlError('Whaat?');
        }
    };
    const schemaZero = {
        doc: {
            name: 'Something',
            description: 'This has something',
            example: ['something'],
        },
        fields: {
            id: { type: 'uint', required: true },
            description: { type: 'string', required: false },
        },
        validator: validatorZero,
    };
    dict.put(typeZero, schemaZero);

    const type = 'companyName';
    const validator = (self) => {
        if (isFalsy(self.name)) {
            throw new RavlError('Whaat?');
        }
    };
    const schema = {
        doc: {
            name: 'Company names',
            description: 'Loads validator from string',
            example: ['apple', 'microsoft', 'google', 'amazon'],
        },
        fields: {
            description: { type: 'string', required: true },
        },
        extends: 'something-here',
        validator,
    };
    dict.put(type, schema);

    const op = {
        doc: {
            name: 'Company names',
            description: 'Loads validator from string',
            example: ['apple', 'microsoft', 'google', 'amazon'],
        },
        fields: {
            id: { type: 'uint', required: true },
            description: { type: 'string', required: true },
        },
        validator,
    };
    expect(dict.get('companyName')).toEqual(op);
});

test('no fields extends', () => {
    const dict = new Dict();

    const type = 'companyName';
    const validator = (self) => {
        if (isFalsy(self.name)) {
            throw new RavlError('Whaat?');
        }
    };
    const schema = {
        doc: {
            name: 'Company names',
            description: 'Loads validator from string',
            example: ['apple', 'microsoft', 'google', 'amazon'],
        },
        fields: {},
        extends: 'something-not-here',
        validator,
    };
    dict.put(type, schema);

    const op = {
        doc: {
            name: 'Company names',
            description: 'Loads validator from string',
            example: ['apple', 'microsoft', 'google', 'amazon'],
        },
        fields: undefined,
        validator,
    };
    expect(dict.get('companyName')).toEqual(op);
});
