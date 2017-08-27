// TRUTHY/FALSY
const isFalsy = val => (val === undefined || val === null || val !== val);
const isTruthy = val => !isFalsy(val);

// BASIC TYPES
const basicTypes = [
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

// TYPEOF
// Mapping to hold javascript class to custom type
const classToType = {};
// populate all the mappings from basicTypes
basicTypes.forEach((type) => {
  classToType[`[object ${type}]`] = type.toLowerCase();
});
const typeOf = (obj) => {
  if (obj == null) {
    return 'null';
  }
  return (typeof obj === 'object' || typeof obj === 'function') ?
    (classToType[classToType.toString.call(obj)] || 'object') :
    typeof obj;
};

// VALIDATION FUNCTIONS
const isValidEmail = (value) => {
  const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(value);
};

const isValidInteger = value => (
  typeOf(value) === 'number' && value % 1 === 0
);

module.exports.isFalsy = isFalsy;
module.exports.isTruthy = isTruthy;
module.exports.basicTypes = basicTypes;
module.exports.typeOf = typeOf;
module.exports.isValidEmail = isValidEmail;
module.exports.isValidInteger = isValidInteger;
