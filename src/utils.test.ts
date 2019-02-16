import {
    isEmptyObject,
} from './utils';

test('check if object is empty', () => {
    expect(isEmptyObject({})).toBe(true);
    expect(isEmptyObject({ some: 'object' })).toBe(false);
});
