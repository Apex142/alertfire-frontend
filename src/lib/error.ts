// src/lib/errors.ts
export class AppError extends Error {
  constructor(public message: string, public statusCode: number = 500) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Ressource non trouvée") {
    super(message, 404);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Action non autorisée") {
    super(message, 403);
  }
}

export class ConflictError extends AppError {
  constructor(message = "Un conflit est survenu") {
    super(message, 409);
  }
}

export class BadRequestError extends AppError {
  constructor(message = "Requête invalide") {
    super(message, 400);
  }
}
