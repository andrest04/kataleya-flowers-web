export class ConflictError extends Error {
  name = 'ConflictError';
}

export function isConflictError(error: unknown): error is ConflictError {
  return error instanceof ConflictError;
}
