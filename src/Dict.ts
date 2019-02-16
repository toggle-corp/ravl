import { getRandomFromList, isDefined, isNotDefined } from '@togglecorp/fujs';

import RavlError from './RavlError';

interface FieldObject {
    type: string | Schema,
    required?: boolean,
};
interface FieldArray {
    arrayType: string | Schema,
    required?: boolean,
}
type Field = FieldObject | FieldArray;

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
    multiple?: boolean,
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

export function isFieldArray(field: Field): field is FieldArray {
    return (field as FieldArray).arrayType !== undefined;
}


function merge<T extends object>(foo: T | undefined, bar : T | undefined): T | undefined {
    if (isNotDefined(foo)) {
        return bar;
    } else if (isNotDefined(bar)) {
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

    has = (type: string) => isDefined(this.schemata[type]);

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

        if (isNotDefined(subResult)) {
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

    private static isString = (type: unknown): type is string => (
        typeof type === 'string'
    )

    private static isTypeForArray = (type: string): type is string => (
        type.startsWith(ARRAY_SUFFIXED)
    )

    private static getContext = (myContext: string | undefined, type: string | BaseSchema) => {
        if (myContext) {
            return myContext;
        }
        if (Dict.isString(type)) {
            return type;
        }
        return 'unknown'
    }

    private validateField = (subObject: unknown, fieldName: string, field: Field, context: string) => {
        const isSubObjectFalsy = isNotDefined(subObject);
        if (!isSubObjectFalsy) {
            if (isFieldArray(field)) {
                // FIXME: override as array
                this.validate(subObject, field.arrayType, true, `${context} > ${fieldName}`);
            } else {
                this.validate(subObject, field.type, false, `${context} > ${fieldName}`);
            }
        } else if (field.required){
            throw new RavlError(`Field '${fieldName}' is required`, context);
        }
    }

    validate = (obj: unknown, type: string | BaseSchema, forceArrayCheck?: boolean, myContext?: string) => {
        const context = Dict.getContext(myContext, type);

        if (isNotDefined(obj)) {
            throw new RavlError(`Value must be defined`, context);
        }

        // NOTE: for array
        if (forceArrayCheck || Dict.isString(type) && Dict.isTypeForArray(type)) {
            const objArr = obj as unknown[];
            // Validate as array
            this.validate(obj, ARRAY, false, context);
            // Get type of children ie: string after 'array.'
            const subType = Dict.isString(type) && Dict.isTypeForArray(type)
                ? type.substring(ARRAY_SUFFIXED.length, type.length)
                : type;
            // Iterate over the elements of array and validate them
            objArr.forEach((subObject: unknown, index: number) => {
                this.validate(subObject, subType, false, `${context} > ${index}`);
            });
            return;
        }

        // NOTE: for anything but array
        const schema = this.get(type);
        const { fields, validator } = schema;

        // NOTE: fields with be truthy for object
        if (isDefined(fields)) {
            const objObj = obj as { [key: string]: unknown };
            // Iterate over fields and validate them
            Object.entries(fields).forEach(([ fieldName, field ]) => {
                // NOTE: '*' is a wildcard, there should be no '*' key on object
                if (fieldName !== '*') {
                    this.validateField(objObj[fieldName], fieldName, field, context);
                }
            });

            const extraFields = Object.entries(objObj).filter(([ fieldName ]) => isNotDefined(fields[fieldName]));
            if (extraFields.length > 0) {
                if (isDefined(fields['*'])) {
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
        if (isDefined(validator)) {
            // run validation hook
            validator(obj, context);
        }
    }

    getSchema = (type: string | Schema, level: number = 0, forceArrayCheck: boolean = false): string | undefined => {
        const tabLevel = TAB.repeat(level);
        const tabLevel1 = TAB.repeat(level + 1);

        // If type starts with 'array.'
        if (forceArrayCheck || Dict.isString(type) && Dict.isTypeForArray(type)) {
            const subType = Dict.isString(type) && Dict.isTypeForArray(type)
                ? type.substring(ARRAY_SUFFIXED.length, type.length)
                : type;
            let schemaForSubType = this.getSchema(subType, level + 1);
            if (isNotDefined(schemaForSubType)) {
                schemaForSubType = `${tabLevel1}'${subType}',`;
            }
            return `${tabLevel}[\n${schemaForSubType}\n${tabLevel}]`;
        }

        // else
        const schema = this.get(type);
        if (isNotDefined(schema.fields)) {
            return undefined;
        }

        let doc = `${tabLevel}{`;
        Object.entries(schema.fields).forEach(([ fieldName, field ]) => {
            // FIXME: check if field.type is string
            let fieldType;
            let schemaForField;
            if (isFieldArray(field)) {
                fieldType = field.arrayType;
                schemaForField = this.getSchema(fieldType, level + 1, true);
            } else {
                fieldType = field.type;
                schemaForField = this.getSchema(fieldType, level + 1, false);
            }
            if (isNotDefined(schemaForField)) {
                schemaForField = ` '${fieldType}'`;
            } else {
                schemaForField = `\n${schemaForField}`;
            }
            doc += `\n${tabLevel1}${fieldName}:${schemaForField},${field.required ? `${TAB}// required` : ''}`; });
        return `${doc}\n${tabLevel}}`;
    };

    getExample = (type: string | Schema, exampleCount: number = 1, randomize: boolean = false, forceArrayCheck: boolean = false): any => {
        // If type starts with 'array.'
        if (forceArrayCheck || Dict.isString(type) && Dict.isTypeForArray(type)) {
            const subType = Dict.isString(type) && Dict.isTypeForArray(type)
                ? type.substring(ARRAY_SUFFIXED.length, type.length)
                : type;
            const opArray = [];
            const count = (randomize ? Math.floor(Math.random()) : 1) * exampleCount;
            for (let i = 0; i < count; i += 1) {
                opArray.push(this.getExample(subType));
            }
            return opArray;
        }

        // Else if
        const schema = this.get(type);
        if (isNotDefined(schema)) {
            throw new RavlError(`'${type}' type is not defined`);
        }
        const {
            fields,
            doc: {
                example = [],
            },
        } = schema;

        // chek if it is basic type
        if (isNotDefined(fields)) {
            return randomize
                ? getRandomFromList(example)
                : example[0];
        }

        const result: any = {};
        Object.keys(fields).forEach((fieldName) => {
            const field = fields[fieldName];
            if (!isNotDefined(field.required) || Math.random() > 0.1) {

                let valueForField;
                if (isFieldArray(field)) {
                    // set false
                    valueForField = this.getExample(field.arrayType, 1, false, true);
                } else {
                    valueForField = this.getExample(field.type, 1, false, false);
                }

                result[fieldName] = valueForField;
            }
        });
        return result;
    };
}
