const { body, validationResult } = require('express-validator');

const validate = (validations) => {
  return async (req, res, next) => {
    // Execute all validations
    await Promise.all(validations.map(validation => validation.run(req)));
    
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    next();
  };
};

// Common validation rules
const customerValidationRules = [
  body('full_name').notEmpty().withMessage('Full name is required'),
  body('phone').notEmpty().withMessage('Phone number is required'),
  body('is_vip').optional().isBoolean(),
  body('is_repeat_customer').optional().isBoolean()
];

const vehicleValidationRules = [
  body('model_id').isInt().withMessage('Valid model ID is required'),
  body('license_plate').notEmpty().withMessage('License plate is required'),
  body('insurance_expiry').isDate().withMessage('Valid insurance expiry date is required'),
  body('license_expiry').isDate().withMessage('Valid license expiry date is required'),
  body('status').isIn(['available', 'booked', 'maintenance']).withMessage('Invalid status')
];

const driverValidationRules = [
  body('name').notEmpty().withMessage('Name is required'),
  body('phone').notEmpty().withMessage('Phone number is required'),
  body('license_number').notEmpty().withMessage('License number is required'),
  body('status').isIn(['available', 'off']).withMessage('Invalid status')
];

const bookingValidationRules = [
  body('customer_id').isInt().withMessage('Valid customer ID is required'),
  body('vehicle_id').isInt().withMessage('Valid vehicle ID is required'),
  body('driver_id').optional({ nullable: true }).isInt().withMessage('Driver ID must be an integer if provided'),
  body('pickup_date').isDate().withMessage('Valid pickup date is required'),
  body('pickup_time').matches(/^([01]\d|2[0-3]):([0-5]\d)$/).withMessage('Valid pickup time is required (HH:MM format)'),
  body('return_date').isDate().withMessage('Valid return date is required'),
  body('return_time').matches(/^([01]\d|2[0-3]):([0-5]\d)$/).withMessage('Valid return time is required (HH:MM format)'),
  body('pickup_location').notEmpty().withMessage('Pickup location is required'),
  body('drop_location').notEmpty().withMessage('Drop location is required'),
  body('payment_status').isIn(['paid', 'pending', 'hold']).withMessage('Invalid payment status')
];

module.exports = {
  validate,
  customerValidationRules,
  vehicleValidationRules,
  driverValidationRules,
  bookingValidationRules
};
