import { Request, Response, NextFunction } from 'express';
import { Schema } from 'joi';

export function validate(schema: Schema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const details = error.details.map((d) => d.message);
      return res.status(400).json({ message: 'Validation error', details });
    }

    req.body = value;
    next();
  };
}

export function validateQuery(schema: Schema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req.query, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const details = error.details.map((d) => d.message);
      return res.status(400).json({ message: 'Validation error', details });
    }

    // Express 5's `req.query` is a getter that re-parses the URL on every
    // access, so mutating the object it returns (e.g. Object.assign) is
    // lost by the time the controller reads it. Replace the getter on this
    // request with the validated/coerced value instead.
    Object.defineProperty(req, 'query', {
      value,
      writable: true,
      configurable: true,
      enumerable: true,
    });
    next();
  };
}