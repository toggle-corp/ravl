const { RavlError } = require('./error');
const { basicTypes, typeOf, isTruthy, isFalsy, isValidEmail, isValidInteger } = require('./common');

class SchemaContainer {
  static createValidator(type) {
    return (self, context) => {
      const identifiedType = typeOf(self);
      if (identifiedType !== type) {
        throw new RavlError(401, `Value must be of type '${type}'`, context);
      }
    };
  }

  constructor() {
    // create empty schema
    this.schemas = {};
    // populate schema with validation for basic types
    basicTypes.forEach((basicType) => {
      const type = basicType.toLowerCase();
      this.schemas[type] = {
        doc: {
          name: basicType,
          description: `Basic type representing ${type}`,
        },
        validator: SchemaContainer.createValidator(type),
      };
    });
  }

  getSchema(type) {
    return this.schemas[type];
  }

  hasSchema(type) {
    return isTruthy(this.schemas[type]);
  }

  setSchema(type, schema) {
    if (this.hasSchema(type)) {
      console.log('WARNING: Overriding existing schema');
    }
    this.schemas[type] = schema;
  }

  _validate(object, type, context) {
    if (isFalsy(type)) {
      throw new RavlError(401, 'Type is not defined', context);
    }
    const ARRAY = 'array';
    const ARRAY_SUFFIXED = 'array.';
    // NOTE: If type starts with 'array.'
    if (type.startsWith(ARRAY_SUFFIXED)) {
      // NOTE: Lists are always required
      if (isFalsy(object)) {
        throw new RavlError(401, `Value must be of type ${ARRAY}`, context);
      }
      // Validate as array
      this._validate(object, ARRAY, context);
      // Get type of children ie: string after 'array.'
      const subType = type.substring(ARRAY_SUFFIXED.length, type.length);
      // Iterate over the elements of array and validate them
      object.forEach((subObject) => {
        this._validate(subObject, subType, `${context} > ${ARRAY}`);
      });
    } else {
      // Get schema
      const schema = this.getSchema(type);
      if (isFalsy(schema)) {
        throw new RavlError(401, 'Schema is not defined', context);
      }
      // Iterate over fields and validate them
      if (isTruthy(schema.fields)) {
        // iterate over fields and validate
        Object.keys(schema.fields).forEach((fieldName) => {
          const field = schema.fields[fieldName];
          const subObject = object[fieldName];
          const isSubObjectFalsy = isFalsy(subObject);
          if (isSubObjectFalsy && field.required) {
            throw new RavlError(401, `Field '${fieldName}' is required`, context);
          } else if (!isSubObjectFalsy) {
            this._validate(subObject, field.type, `${context} > ${fieldName}`);
          }
        });
      }
      // Run validation function on the object
      if (isTruthy(schema.validator)) {
        // run validation hook
        schema.validator(object, context);
      }
      // Check for fields that shouldn't be present
      if (isTruthy(schema.fields)) {
        const fieldsInObject = isTruthy(object) ? Object.keys(object) : [];
        const extraFields = fieldsInObject.filter(x => isFalsy(schema.fields[x]));
        if (extraFields.length > 0) {
          throw new RavlError(401, `Extra field(s) present: '${extraFields}'`, context);
        }
      }
    }
  }

  validate(object, type) {
    this._validate(object, type, type);
  }

  // TODO: cache this
  _getSchemaExpanded(type, level) {
    const tab = '    ';
    const tabLevel = tab.repeat(level);
    const tabLevel1 = tab.repeat(level + 1);
    const ARRAY_SUFFIXED = 'array.';

    // If type starts with 'array.'
    if (type.startsWith(ARRAY_SUFFIXED)) {
      const subType = type.substring(ARRAY_SUFFIXED.length, type.length);
      let schemaForSubType = this._getSchemaExpanded(subType, level + 1);
      if (isFalsy(schemaForSubType)) {
        schemaForSubType = `${tabLevel1}'${subType}',`;
      }
      return `${tabLevel}[\n${schemaForSubType}\n${tabLevel}]`;
    }

    // Else if
    const schema = this.getSchema(type);
    if (isFalsy(schema)) {
      throw new RavlError(401, 'Type is not defined');
    }
    if (isFalsy(schema.fields)) {
      return undefined;
    }

    let doc = `${tabLevel}{`;
    Object.keys(schema.fields).forEach((fieldName) => {
      const field = schema.fields[fieldName];
      let schemaForField = this._getSchemaExpanded(field.type, level + 1);
      if (isFalsy(schemaForField)) {
        schemaForField = ` '${field.type}'`;
      } else {
        schemaForField = `\n${schemaForField}`;
      }
      doc += `\n${tabLevel1}${fieldName}:${schemaForField},${field.required ? '    // required' : ''}`;
    });
    return `${doc}\n${tabLevel}}`;
  }

  getSchemaExpanded(type) {
    return this._getSchemaExpanded(type, 0);
  }
}

const schemaContainer = new SchemaContainer();

// Add schema for email
{
  const type = 'email';
  const schema = {
    doc: {
      name: 'Email',
      description: `Basic type which denotes a valid email.`,
      example: ['johndoe@email.com', 'hariprasad@emailer.com'],
    },
    validator: (self, context) => {
      if (!isValidEmail(self)) {
        throw new RavlError(401, 'Value is not a valid email', context);
      }
    },
  };
  schemaContainer.setSchema(type, schema);
}
// Add schema for int
{
  const type = 'int';
  const schema = {
    doc: {
      name: 'Integer',
      description: `Basic type which denotes a number without decimal parts.`,
      example: [1, 2, 10, -12, 11, 0],
    },
    validator: (self, context) => {
      if (!isValidInteger(self)) {
        throw new RavlError(401, 'Value is not a valid integer', context);
      }
    },
  };
  schemaContainer.setSchema(type, schema);
}
// Add schema for uint
{
  const type = 'uint';
  const schema = {
    doc: {
      name: 'Unsigned Integer',
      description: `Basic type which denotes a positive integer.`,
      example: [1, 2, 10, 11, 0],
    },
    validator: (self, context) => {
      if (!isValidInteger(self) || self < 0) {
        throw new RavlError(401, 'Value is not a valid unsigned integer', context);
      }
    },
  };
  schemaContainer.setSchema(type, schema);
}

module.exports.schemaContainer = schemaContainer;

// TODO
/*
const doc = {
  description: '', // DONE
  note: '', // DONE

  hidden: false,
  tags: [],
  example: [], // can be put for only basic types
};
// fake data generator
*/
