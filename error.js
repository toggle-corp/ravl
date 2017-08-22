// Error class can be further extended
class ExtendableError extends Error {
  constructor(message) {
    super(message);
    this.name = this.constructor.name;
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, this.constructor);
    } else {
      this.stack = (new Error(message)).stack;
    }
  }
}

// Validation layer error
class RavlError extends ExtendableError {
  constructor(code, description, context) {
    super(`CODE: ${code}\nDESCRIPTION: ${description}\nCONTEXT: ${context}`);
    this.code = code;
    this.description = description;
    this.context = context;
  }
}

module.exports.ExtendableError = ExtendableError;
module.exports.RavlError = RavlError;
