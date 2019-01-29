import {
    isTruthy,
    isFalsy,
    getRandomFromList,
} from './utils';
import RavlError from './RavlError';

interface Field {
    type: string | Schema,
    required?: boolean,
};

interface Fields {
    [key: string]: Field
}

interface Doc {
    name: string,
    description?: string,
    example?: string[],
    note?: string,
};

interface ExtensionSchema {
    extends: string,
    doc: Doc,
    validator?(object: unknown, context: string): void,
    fields?: Fields;
}

interface BaseSchema {
    doc: Doc,
    validator?(object: unknown, context: string): void,
    fields?: Fields;
}

interface DictConfig {
    warning?: boolean,
}

export type Schema = BaseSchema | ExtensionSchema;

export function isExtensionSchema(schema: Schema): schema is ExtensionSchema {
    return (schema as ExtensionSchema).extends !== undefined;
}

function merge<T extends object>(foo: T | undefined, bar : T | undefined): T | undefined {
    if (isFalsy(foo)) {
        return bar;
    } else if (isFalsy(bar)) {
        return foo;
    }
    return { ...foo as object, ...bar as object } as T;
}

const ARRAY = 'array';
const ARRAY_SUFFIXED = 'array.';
const TAB = '    ';

export default class Dict {
    private schemata: { [key: string]: Schema }
    private config: DictConfig

    constructor(config: DictConfig = {}) {
        this.schemata = {};
        this.config = config;
    }

    has = (type: string) => isTruthy(this.schemata[type]);

    put = (type: string, schema: Schema) => {
        if (this.has(type) && this.config.warning) {
            console.warn(`Warning: Overriding schema for key '${type}'`);
        }
        if (isExtensionSchema(schema) && !this.schemata[schema.extends]) {
            throw new RavlError(`Subtype '${schema.extends}' not found`);
        }
        this.schemata[type] = schema;
    }

    get = (type: string | Schema): BaseSchema => {
        let result;
        if (typeof type === 'string') {
            if (!this.has(type)) {
                throw new RavlError(`Key '${type}' not found`);
            }
            result = this.schemata[type];
        } else {
            result = type;
        }

        if (!isExtensionSchema(result)) {
            return result;
        }

        let subResult = this.get(result.extends);

        if (isFalsy(subResult)) {
            throw new RavlError(`Subtype '${result.extends}' not found`);
        }


        return {
            doc: {...subResult.doc, ...result.doc},
            fields: merge<Fields>(subResult.fields, result.fields),
            validator: result.validator || subResult.validator,
        };
    }

    list = () => {
        return Object.keys(this.schemata);
    }

    private validateField = (subObject: unknown, fieldName: string, field: Field, context: string) => {
        const isSubObjectFalsy = isFalsy(subObject);
        if (!isSubObjectFalsy) {
            this.validate(subObject, field.type, `${context} > ${fieldName}`);
        } else if (field.required){
            throw new RavlError(`Field '${fieldName}' is required`, context);
        }
    }

    validate = (obj: unknown, type: string | BaseSchema, myContext?: string) => {
        const context = myContext || (typeof type === 'string') ? type as string : 'unknown';

        if (isFalsy(obj)) {
            throw new RavlError(`Value must be defined`, context);
        }
        // NOTE: for array
        if (typeof type === 'string' && type.startsWith(ARRAY_SUFFIXED)) {
            const objArr = obj as unknown[];
            // Validate as array
            this.validate(obj, ARRAY, context);
            // Get type of children ie: string after 'array.'
            const subType = type.substring(ARRAY_SUFFIXED.length, type.length);
            // Iterate over the elements of array and validate them
            objArr.forEach((subObject: unknown) => {
                this.validate(subObject, subType, `${context} > ${ARRAY}`);
            });
            return;
        }

        // NOTE: for anything but array
        const schema = this.get(type);
        const { fields, validator } = schema;

        // NOTE: fields with be truthy for object
        if (isTruthy(fields)) {
            const objObj = obj as { [key: string]: unknown };
            // Iterate over fields and validate them
            Object.entries(fields).forEach(([ fieldName, field ]) => {
                // NOTE: '*' is a wildcard, there should be no '*' key on object
                if (fieldName !== '*') {
                    this.validateField(objObj[fieldName], fieldName, field, context);
                }
            });

            const extraFields = Object.entries(objObj).filter(([ fieldName ]) => isFalsy(fields[fieldName]));
            if (extraFields.length > 0) {
                if (isTruthy(fields['*'])) {
                    // iterate over remaining object keys and validate
                    extraFields.forEach(([fieldName, subObject]) => {
                        const field = fields['*'];
                        this.validateField(subObject, fieldName, field, context);
                    });
                } else if (this.config.warning) {
                    const extraFieldNames = extraFields.map(([fieldName]) => fieldName);
                    console.warn(`Warning: Extra field${extraFields.length > 1 ? 's' : ''} present: '${extraFieldNames}'\nContext: ${context}`);
                }
            }
        }

        // NOTE: validation is defined for every basic type
        // TODO: Should we move validator before checking fields?
        // Run validation function on the object
        if (isTruthy(validator)) {
            // run validation hook
            validator(obj, context);
        }
    }

    getSchema = (type: string | Schema, level: number = 0): string | undefined => {
        const tabLevel = TAB.repeat(level);
        const tabLevel1 = TAB.repeat(level + 1);

        // If type starts with 'array.'
        if (typeof type === 'string' && type.startsWith(ARRAY_SUFFIXED)) {
            const subType = type.substring(ARRAY_SUFFIXED.length, type.length);
            let schemaForSubType = this.getSchema(subType, level + 1);
            if (isFalsy(schemaForSubType)) {
                schemaForSubType = `${tabLevel1}'${subType}',`;
            }
            return `${tabLevel}[\n${schemaForSubType}\n${tabLevel}]`;
        }

        // else
        const schema = this.get(type);
        if (isFalsy(schema.fields)) {
            return undefined;
        }

        let doc = `${tabLevel}{`;
        Object.entries(schema.fields).forEach(([ fieldName, field ]) => {
            // FIXME: check if field.type is string
            let schemaForField = this.getSchema(field.type, level + 1);
            if (isFalsy(schemaForField)) {
                schemaForField = ` '${field.type}'`;
            } else {
                schemaForField = `\n${schemaForField}`;
            }
            doc += `\n${tabLevel1}${fieldName}:${schemaForField},${field.required ? `${TAB}// required` : ''}`; });
        return `${doc}\n${tabLevel}}`;
    };

    getExample = (type: string | Schema, exampleCount: number = 1, randomize: boolean = false): any => {
        // If type starts with 'array.'
        if (typeof type === 'string' && type.startsWith(ARRAY_SUFFIXED)) {
            const subType = type.substring(ARRAY_SUFFIXED.length, type.length);
            const opArray = [];
            const count = (randomize ? Math.floor(Math.random()) : 1) * exampleCount;
            for (let i = 0; i < count; i += 1) {
                opArray.push(this.getExample(subType));
            }
            return opArray;
        }

        // Else if
        const schema = this.get(type);
        if (isFalsy(schema)) {
            throw new RavlError(`'${type}' type is not defined`);
        }
        const {
            fields,
            doc: {
                example = [],
            },
        } = schema;

        // chek if it is basic type
        if (isFalsy(fields)) {
            return randomize
                ? getRandomFromList(example)
                : example[0];
        }

        const result: any = {};
        Object.keys(fields).forEach((fieldName) => {
            const field = fields[fieldName];
            if (!isFalsy(field.required) || Math.random() > 0.1) {
                const valueForField = this.getExample(field.type);
                result[fieldName] = valueForField;
            }
        });
        return result;
    };
}
