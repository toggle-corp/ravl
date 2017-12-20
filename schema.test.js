import schema, { typeOf } from './schema';

test('schema must be object', () => {
    expect(typeof schema).toBe('object');
    expect(typeof typeOf).toBe('function');
});
