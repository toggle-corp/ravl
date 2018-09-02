import RavlError from './RavlError';

test('error must be ravl error', () => {
    try {
        throw new RavlError('Some error occured', undefined);
    } catch (e) {
        expect(e instanceof Error).toBeTruthy()
        expect(e instanceof RavlError).toBeTruthy()
    }
});
