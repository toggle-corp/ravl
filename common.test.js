import {
    isFalsy,
    getRandomFromList,
    isEmptyObject,
    isValidInteger,
    isValidEmail,
} from './common';

test('random is from list', () => {
    const listing = [1, 2, 'hari', 'shyam'];
    expect(listing).toContain(getRandomFromList(listing));
    expect(listing).toContain(getRandomFromList(listing));
    expect(listing).toContain(getRandomFromList(listing));
    expect(listing).toContain(getRandomFromList(listing));
});

test('isFalsy', () => {
    expect(isFalsy(NaN)).toBe(true);
    expect(isFalsy(undefined)).toBe(true);
    expect(isFalsy(null)).toBe(true);
    expect(isFalsy(false)).toBe(false);
    expect(isFalsy('')).toBe(false);
    expect(isFalsy([])).toBe(false);
    expect(isFalsy(0)).toBe(false);
});

test('integer condition', () => {
    expect(isValidInteger(12)).toBe(true);
    expect(isValidInteger(-12)).toBe(true);
    expect(isValidInteger(0)).toBe(true);
    expect(isValidInteger(0.00)).toBe(true);
    expect(isValidInteger(-1.12)).toBe(false);
    expect(isValidInteger(12.012)).toBe(false);
    expect(isValidInteger('12')).toBe(false);
    expect(isValidInteger('23.12')).toBe(false);
    expect(isValidInteger({})).toBe(false);
    expect(isValidInteger(undefined)).toBe(false);
    expect(isValidInteger(null)).toBe(false);
    expect(isValidInteger(NaN)).toBe(false);
    expect(isValidInteger([])).toBe(false);
});

test('check if object is empty', () => {
    expect(isEmptyObject({})).toBe(true);
    expect(isEmptyObject({ some: 'object' })).toBe(false);
});

test('email condition', () => {
    expect(isValidEmail('hari@test.com')).toBe(true);
    expect(isValidEmail('panda')).toBe(false);
    expect(isValidEmail('panda.com')).toBe(false);
    expect(isValidEmail('&*^%$#$%^&*&^%$#@.com')).toBe(false);
    expect(isValidEmail('@eampl.com')).toBe(false);
    expect(isValidEmail('Joe Smith <email@example.com>')).toBe(false);
    expect(isValidEmail('email..email@example.com')).toBe(false);
    expect(isValidEmail('email@example.com (Joe Smith)')).toBe(false);
    expect(isValidEmail('email@example')).toBe(false);
    expect(isValidEmail('email@111.222.333.44444')).toBe(false);
    expect(isValidEmail('email@example..com')).toBe(false);
    expect(isValidEmail('Abc..123@example.com')).toBe(false);
});
