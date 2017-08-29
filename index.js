// ERRORS
const { RavlError } = require('./error');
const { isFalsy, typeOf } = require('./common');
const { schemaContainer } = require('./schema');

// Adding user defined schema
{
  const name = 'district';
  const schema = {
    doc: {
      name: 'District',
      description: `User type containing information related  a district.`,
      note: 'A district can be assigned with one more officer if required.',
    },
    fields: {
      id: { type: 'uint', required: true },
      index: { type: 'number', required: false },
      name: { type: 'string', required: true },
      description: { type: 'string', required: false },
      officerAssigned: { type: 'officer', required: false },
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
  const name = 'officer';
  const schema = {
    doc: {
      name: 'District Officer',
      description: `User type containing information related an officer.`,
    },
    fields: {
      id: { type: 'uint', required: true },
      name: { type: 'string', required: false },
      wards: { type: 'array.string', required: true },
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

  const elems = [
    { type: 'int', level: 1, example: true },
    { type: 'uint', level: 1, example: true },
    { type: 'email', level: 1, example: true },
    { type: 'district', level: 2 },
    { type: 'officer', level: 3 },
    // 'array.array.officer',
    // 'array.array.uint',
  ];
  const surroundBacktick = a => `\`${a}\``;
  elems.forEach((elem) => {
    const schemaEx = schemaContainer.getSchemaExpanded(elem.type);
    const schema = schemaContainer.getSchema(elem.type);
    if (schema && schema.doc) {
      console.log(`${'#'.repeat(elem.level)} ${schema.doc.name}`);
      if (schema.doc.description) {
        console.log(schema.doc.description);
      }
      if (elem.example && schema.doc.example) {
        console.log(`Example: ${schema.doc.example.map(surroundBacktick).join(', ')}`);
      }
      if (schemaEx) {
        console.log(`\`\`\`javascript\n${schemaEx}\n\`\`\``);
      }
      if (schema.doc.note) {
        console.log(`> ${schema.doc.note}`);
      }
      console.log();
    } else {
      // for arrays
    }
  });

  console.log(JSON.stringify(schemaContainer.getValues('district'), null, 2));
} catch (ex) {
  if (ex instanceof RavlError) {
    console.log(ex.message);
  } else {
    throw ex;
  }
}
