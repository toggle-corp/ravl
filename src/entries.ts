import { Schema } from './Dict';
import RavlError from './RavlError';
import {
    basicTypes,
    typeOf,
    isValidEmail,
    isValidInteger,
} from './utils';

const examples: { [key: string]: any[] } = {
    boolean: [
        true, false,
    ],
    number: [
        1, 3, 4, 5, 6, 0, -1, -2, -3, -4, -10, -11, -10.12, 11.2121, 1298.432,
        432.342, -23819.12, 3213, 23.21,
    ],
    string: [
        'ram', 'shyam', 'hari', 'home', 'city', 'long text', 'ankit',
        'placeholder',
    ],
    email: [
        'johndoe@email.com', 'hariprasad@emailer.com', 'frozenhelium@toggle.com',
        'doe.john@email.com', 'ramprasad1212@emailer.com', 'fruity1994@toggle.com',
    ],
    int: [
        1, 2, 10, -12, 11, 0,
        -3, 6, 7, -15, 14, -7,
    ],
    uint: [
        1, 2, 10, 11, 0,
        6, 7, 16, 13, 5,
    ],
};

// Add schema for basic types
const entries: Schema[] = basicTypes.map((basicType) => {
    const type = basicType.toLowerCase();
    const schema: Schema = {
        doc: {
            name: type,
            description: `Basic ${type}`,
            example: examples[type],
        },
        validator: (self: unknown, context: string) => {
            const identifiedType = typeOf(self);
            if (identifiedType !== type) {
                throw new RavlError(`Value must be of type '${type}'`, context);
            }
        },
    };
    return schema;
});

// Add schema for email
entries.push({
    doc: {
        name: 'email',
        description: 'Email',
        example: examples.email,
    },
    validator: (self: unknown, context: string) => {
        if (!isValidEmail(self)) {
            throw new RavlError('Value is not a valid email', context);
        }
    },
})
// Add schema for int
entries.push({
    doc: {
        name: 'int',
        description: 'Integer',
        example: examples.int,
    },
    validator: (self: unknown, context: string) => {
        if (!isValidInteger(self)) {
            throw new RavlError('Value is not a valid integer', context);
        }
    },
});
// Add schema for uint
entries.push({
    doc: {
        name: 'uint',
        description: 'Unsigned Integer',
        example: examples.uint,
    },
    validator: (self: unknown, context: string) => {
        if (!isValidInteger(self) || self < 0) {
            throw new RavlError('Value is not a valid unsigned integer', context);
        }
    },
});

export default entries;
