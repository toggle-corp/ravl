import { ExtendableError, RavlError } from './error';

test('error must be exported', () => {
    expect(typeof ExtendableError).toBe('function');
    expect(typeof RavlError).toBe('function');
});
