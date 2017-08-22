// ERRORS
const { RavlError } = require('./error');
const { isFalsy, isTruthy, typeOf } = require('./common');
const { schemaContainer } = require('./schema');

// Adding user defined schema
{
  const name = 'district';
  const schema = {
    fields: {
      id: { type: 'number', required: true },
      name: { type: 'string', required: true },
      description: { type: 'string', required: false },
      managerAssigned: { type: 'manager', required: false },
    },
    validator: (self, context) => {
      if (isFalsy(self.description)) {
        return;
      }
      if (!typeOf(self.description) === 'string') {
        throw new RavlError(401, 'Value must be of type \'string\'', context);
      }
      if (self.description.length <= 5) {
        throw new RavlError(401, 'Length must be greater than 5', context);
      }
    },
  };
  schemaContainer.setSchema(name, schema);
}
{
  const name = 'manager';
  const schema = {
    fields: {
      id: { type: 'uint', required: true },
      name: { type: 'string', required: false },
    },
  };
  schemaContainer.setSchema(name, schema);
}

try {
  schemaContainer.validate('hari', 'string');
  schemaContainer.validate(false, 'boolean');
  schemaContainer.validate(12121, 'number');
  schemaContainer.validate(12121.021, 'number');
  schemaContainer.validate(-12121.021, 'number');
  schemaContainer.validate([[[1, 2]]], 'array');
  schemaContainer.validate([[[1, 2]]], 'array.array');
  schemaContainer.validate([[[1, 2]]], 'array.array.array');
  schemaContainer.validate([[[1, 2]]], 'array.array.array.number');
  schemaContainer.validate(-1, 'int');
  schemaContainer.validate(1, 'uint');
  schemaContainer.validate('shyam@gmail.com', 'email');
  schemaContainer.validate({ id: 12, name: 'kaski', description: 'Best district' }, 'district');
  schemaContainer.validate({ id: 12, name: 'kaski', description: 'Best district' }, 'district');
  schemaContainer.validate({ id: 12, name: 'kaski' }, 'district');

  const schema = schemaContainer.getSchemaExpanded('district');
  console.log(JSON.stringify(schema, null, 2));
} catch (ex) {
  if (ex instanceof RavlError) {
    console.log(ex.message);
  } else {
    throw ex;
  }
}
