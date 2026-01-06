export class AppError extends Error {
  constructor(
    public readonly message: string,
    public readonly statusCode: number = 500,
    public readonly code?: string
  ) {
    super(message);
    this.name = 'AppError';
    Object.setPrototypeOf(this, AppError.prototype);
  }

  static badRequest(message: string, code?: string) {
    return new AppError(message, 400, code);
  }

  static unauthorized(message = 'Unauthorized') {
    return new AppError(message, 401, 'UNAUTHORIZED');
  }

  static forbidden(message = 'Forbidden') {
    return new AppError(message, 403, 'FORBIDDEN');
  }

  static notFound(message = 'Not found') {
    return new AppError(message, 404, 'NOT_FOUND');
  }

  static conflict(message: string, code?: string) {
    return new AppError(message, 409, code);
  }

  static internal(message = 'Internal server error') {
    return new AppError(message, 500, 'INTERNAL_ERROR');
  }
}
