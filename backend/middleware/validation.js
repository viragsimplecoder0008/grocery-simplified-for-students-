const Joi = require('joi');

const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    
    if (error) {
      const errorMessage = error.details.map(detail => detail.message).join(', ');
      return res.status(400).json({ 
        error: 'Validation error',
        message: errorMessage 
      });
    }
    
    next();
  };
};

// Common validation schemas
const schemas = {
  // Group validation
  createGroup: Joi.object({
    name: Joi.string().min(1).max(100).required(),
    description: Joi.string().max(500).optional(),
    currency: Joi.string().length(3).optional()
  }),

  updateGroup: Joi.object({
    name: Joi.string().min(1).max(100).optional(),
    description: Joi.string().max(500).optional(),
    currency: Joi.string().length(3).optional()
  }),

  // Product validation
  createProduct: Joi.object({
    name: Joi.string().min(1).max(100).required(),
    category: Joi.string().min(1).max(50).required(),
    brand: Joi.string().min(1).max(50).optional(),
    price: Joi.number().positive().required(),
    quantity: Joi.number().integer().min(1).required(),
    unit: Joi.string().min(1).max(20).required(),
    notes: Joi.string().max(500).optional(),
    group_id: Joi.string().uuid().required()
  }),

  updateProduct: Joi.object({
    name: Joi.string().min(1).max(100).optional(),
    category: Joi.string().min(1).max(50).optional(),
    brand: Joi.string().min(1).max(50).optional(),
    price: Joi.number().positive().optional(),
    quantity: Joi.number().integer().min(1).optional(),
    unit: Joi.string().min(1).max(20).optional(),
    notes: Joi.string().max(500).optional(),
    is_purchased: Joi.boolean().optional()
  }),

  // Payment validation
  createPayment: Joi.object({
    amount: Joi.number().positive().required(),
    description: Joi.string().min(1).max(200).required(),
    group_id: Joi.string().uuid().required(),
    payment_method: Joi.string().valid('razorpay', 'cash', 'upi').required()
  }),

  // User profile validation
  updateProfile: Joi.object({
    full_name: Joi.string().min(1).max(100).optional(),
    avatar_url: Joi.string().uri().optional(),
    phone: Joi.string().pattern(/^[+]?[\d\s-()]+$/).optional(),
    currency: Joi.string().length(3).optional()
  })
};

module.exports = {
  validate,
  schemas
};
