import Joi from 'joi';

export const updateProfileSchema = Joi.object({
  firstName: Joi.string().min(1),
  lastName: Joi.string().min(1),
  email: Joi.string().email(),
}).min(1);