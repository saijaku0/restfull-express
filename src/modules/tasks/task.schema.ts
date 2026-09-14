import Joi from 'joi';

export const createTaskSchema = Joi.object({
  title: Joi.string().min(1).required(),
  description: Joi.string().allow('').optional(),
  priority: Joi.string().valid('low', 'medium', 'high').optional(),
});

export const listTasksSchema = Joi.object({
  status: Joi.string().valid('pending', 'in_progress', 'completed').optional(),
  priority: Joi.string().valid('low', 'medium', 'high').optional(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
});

export const updateTaskSchema = Joi.object({
  title: Joi.string().min(1),
  description: Joi.string().allow(''),
  status: Joi.string().valid('pending', 'in_progress', 'completed'),
  priority: Joi.string().valid('low', 'medium', 'high'),
}).min(1);