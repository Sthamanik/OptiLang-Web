export class ApiError extends Error {
  statusCode: number;
  success: boolean;
  errors: string[];
  data: null;

  constructor(
    statusCode: number,
    message: string = "Something went wrong",
    errors: string[] = []
  ) {
    super(message);
    this.statusCode = statusCode;
    this.success = false;
    this.errors = errors;
    this.data = null;

    Error.captureStackTrace(this, this.constructor);
  }
}