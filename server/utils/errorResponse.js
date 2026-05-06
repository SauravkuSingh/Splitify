class ErrorResponse extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.name = this.constructor.name; // ← yeh line add karo
    Error.captureStackTrace(this, this.constructor); // ← yeh bhi
  }
}

export default ErrorResponse;