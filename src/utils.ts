export const getRandomFromList = <T>(items: T[] | undefined): T | undefined => (
    items ? items[Math.floor(Math.random() * items.length)] : undefined
);

export const isEmptyObject = (obj: object) => (
    Object.keys(obj).length === 0
);

// TRUTHY/FALSY
export const isFalsy = (val: any | undefined): val is undefined => (
    val === undefined || val === null || Number.isNaN(val)
);
export const isTruthy = (val: any | undefined): val is {} => !isFalsy(val);

// BASIC TYPES
export const basicTypes: string[] = [
    'Boolean',
    'Number',
    'String',
    'Function',
    'Array',
    'Date',
    'RegExp',
    'Object',
    'Error',
    'Symbol',
];

interface MapOfString {
    [key: string]: string
};

// Mapping to hold javascript class to custom type
const classToType: MapOfString  = basicTypes.reduce(
    (acc, type: string) => ({
        ...acc,
        [`[object ${type}]`]: type.toLowerCase(),
    }),
    {},
);

// TYPEOF
export const typeOf = (obj: any): string => {
    if (obj == null) {
        return 'null';
    }

    const simpleType = typeof obj;
    return (simpleType === 'object' || simpleType === 'function')
        ? (classToType[classToType.toString.call(obj)] || 'object')
        : simpleType;
};

// VALIDATION FUNCTIONS
export const isValidEmail = (value: any): boolean => {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(value);
};

export const isValidInteger = (value: any): value is number => (
    typeOf(value) === 'number' && value % 1 === 0
);
