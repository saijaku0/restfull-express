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