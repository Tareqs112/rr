import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Button, 
  Grid, 
  TextField, 
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  FormHelperText,
  Stepper,
  Step,
  StepLabel,
  Card,
  CardContent,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import bookingService from '../../services/bookings';
import customerService from '../../services/customers';
import vehicleService from '../../services/vehicles';
import driverService from '../../services/drivers';
import notificationService from '../../services/notifications';
import moment from 'moment';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';

const BookingForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(id ? true : false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [availableVehicles, setAvailableVehicles] = useState([]);
  const [availableDrivers, setAvailableDrivers] = useState([]);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [conflictDialogOpen, setConflictDialogOpen] = useState(false);
  const [conflicts, setConflicts] = useState([]);
  const isEditMode = Boolean(id);

  // Initialize with date from state if provided (from calendar click)
  const initialDate = location.state?.initialDate ? moment(location.state.initialDate) : moment();

  const steps = ['Customer Information', 'Vehicle Selection', 'Driver & Payment', 'Confirmation'];

  const validationSchema = [
    // Step 1: Customer Information
    Yup.object({
      customer_id: Yup.number().required('Customer is required'),
      pickup_date: Yup.date().required('Pickup date is required'),
      pickup_time: Yup.string().required('Pickup time is required'),
      return_date: Yup.date().required('Return date is required'),
      return_time: Yup.string().required('Return time is required'),
      pickup_location: Yup.string().required('Pickup location is required'),
      return_location: Yup.string().required('Return location is required')
    }),
    // Step 2: Vehicle Selection
    Yup.object({
      vehicle_id: Yup.number().required('Vehicle is required')
    }),
    // Step 3: Driver & Payment
    Yup.object({
      driver_id: Yup.number().nullable(),
      payment_status: Yup.string().oneOf(['paid', 'pending', 'hold'], 'Invalid payment status').required('Payment status is required'),
      payment_method: Yup.string().when('payment_status', {
        is: 'paid',
        then: () => Yup.string().required('Payment method is required'),
        otherwise: () => Yup.string().nullable()
      }),
      total_amount: Yup.number().min(0, 'Amount must be positive').required('Total amount is required')
    })
  ];

  const formik = useFormik({
    initialValues: {
      customer_id: '',
      pickup_date: initialDate.format('YYYY-MM-DD'),
      pickup_time: initialDate.format('HH:mm'),
      return_date: initialDate.add(1, 'days').format('YYYY-MM-DD'),
      return_time: initialDate.format('HH:mm'),
      pickup_location: '',
      return_location: '',
      vehicle_id: '',
      driver_id: null,
      payment_status: 'pending',
      payment_method: '',
      total_amount: 0,
      notes: ''
    },
    validationSchema: validationSchema[activeStep],
    validateOnChange: false,
    validateOnBlur: false,
    onSubmit: async (values) => {
      if (activeStep === steps.length - 1) {
        // Final submission
        try {
          const bookingData = {
            ...values,
            booking_id: isEditMode ? undefined : `BK-${Math.floor(100000 + Math.random() * 900000)}`
          };
          
          if (isEditMode) {
            await bookingService.updateBooking(id, bookingData);
            setSuccess('Booking updated successfully');
          } else {
            await bookingService.createBooking(bookingData);
            setSuccess('Booking created successfully');
            
            // Send notification if customer has phone number
            const customer = customers.find(c => c.id === parseInt(values.customer_id));
            if (customer && customer.phone) {
              try {
                await notificationService.sendNotification({
                  to: customer.phone,
                  type: 'sms',
                  message: `Your booking (${bookingData.booking_id}) has been confirmed. Pickup: ${moment(values.pickup_date).format('MMM D, YYYY')} at ${values.pickup_time}.`
                });
              } catch (err) {
                console.error('Failed to send notification:', err);
              }
            }
          }
          
          // Navigate back after a short delay
          setTimeout(() => {
            navigate('/bookings');
          }, 1500);
        } catch (err) {
          setError(err.response?.data?.message || 'An error occurred');
          console.error(err);
        }
      } else {
        // Move to next step
        handleNext();
      }
    }
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [customersResponse, vehiclesResponse, driversResponse] = await Promise.all([
          customerService.getAllCustomers(),
          vehicleService.getAllVehicles(),
          driverService.getAllDrivers()
        ]);
        
        setCustomers(customersResponse.customers);
        setVehicles(vehiclesResponse.vehicles);
        setDrivers(driversResponse.drivers);
        
        // If editing, fetch booking details
        if (id) {
          setLoading(true);
          const bookingResponse = await bookingService.getBookingById(id);
          const booking = bookingResponse.booking;
          
          formik.setValues({
            customer_id: booking.customer_id || '',
            pickup_date: moment(booking.pickup_date).format('YYYY-MM-DD'),
            pickup_time: booking.pickup_time || '',
            return_date: moment(booking.return_date).format('YYYY-MM-DD'),
            return_time: booking.return_time || '',
            pickup_location: booking.pickup_location || '',
            return_location: booking.return_location || '',
            vehicle_id: booking.vehicle_id || '',
            driver_id: booking.driver_id || null,
            payment_status: booking.payment_status || 'pending',
            payment_method: booking.payment_method || '',
            total_amount: booking.total_amount || 0,
            notes: booking.notes || ''
          });
          
          // Check availability for the current dates
          await checkAvailability(booking.pickup_date, booking.pickup_time, booking.return_date, booking.return_time, booking.id);
          
          setLoading(false);
        } else {
          // For new booking, check availability for the initial dates
          await checkAvailability(formik.values.pickup_date, formik.values.pickup_time, formik.values.return_date, formik.values.return_time);
        }
      } catch (err) {
        setError('Failed to fetch data');
        console.error(err);
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const checkAvailability = async (pickupDate, pickupTime, returnDate, returnTime, excludeBookingId = null) => {
    try {
      setCheckingAvailability(true);
      
      const response = await bookingService.checkVehicleAvailability({
        pickup_date: pickupDate,
        pickup_time: pickupTime,
        return_date: returnDate,
        return_time: returnTime,
        exclude_booking_id: excludeBookingId
      });
      
      setAvailableVehicles(response.available_vehicles);
      setAvailableDrivers(response.available_drivers);
      setConflicts(response.conflicts || []);
      
      // If current vehicle is not available, show conflict dialog
      if (formik.values.vehicle_id && 
          !response.available_vehicles.some(v => v.id === parseInt(formik.values.vehicle_id))) {
        setConflictDialogOpen(true);
      }
      
      setCheckingAvailability(false);
    } catch (err) {
      setError('Failed to check availability');
      console.error(err);
      setCheckingAvailability(false);
    }
  };

  const handleNext = () => {
    const currentValidationSchema = validationSchema[activeStep];
    
    try {
      currentValidationSchema.validateSync(formik.values, { abortEarly: false });
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    } catch (err) {
      const validationErrors = {};
      err.inner.forEach((error) => {
        validationErrors[error.path] = error.message;
      });
      formik.setErrors(validationErrors);
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleDateChange = async () => {
    // Check availability when dates change
    await checkAvailability(
      formik.values.pickup_date,
      formik.values.pickup_time,
      formik.values.return_date,
      formik.values.return_time,
      isEditMode ? id : null
    );
  };

  const closeConflictDialog = () => {
    setConflictDialogOpen(false);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        {isEditMode ? 'Edit Booking' : 'New Booking'}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      <Paper sx={{ p: 3, mb: 3 }}>
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <form onSubmit={formik.handleSubmit}>
          {activeStep === 0 && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <FormControl 
                  fullWidth 
                  error={formik.touched.customer_id && Boolean(formik.errors.customer_id)}
                >
                  <InputLabel id="customer-label">Customer</InputLabel>
                  <Select
                    labelId="customer-label"
                    id="customer_id"
                    name="customer_id"
                    value={formik.values.customer_id}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    label="Customer"
                  >
                    {customers.map((customer) => (
                      <MenuItem key={customer.id} value={customer.id}>
                        {customer.full_name} {customer.is_vip && '(VIP)'} - {customer.phone}
                      </MenuItem>
                    ))}
                  </Select>
                  {formik.touched.customer_id && formik.errors.customer_id && (
                    <FormHelperText>{formik.errors.customer_id}</FormHelperText>
                  )}
                </FormControl>
              </Grid>
              
              <LocalizationProvider dateAdapter={AdapterMoment}>
                <Grid item xs={12} md={6}>
                  <DatePicker
                    label="Pickup Date"
                    value={moment(formik.values.pickup_date)}
                    onChange={(date) => {
                      formik.setFieldValue('pickup_date', date.format('YYYY-MM-DD'));
                      handleDateChange();
                    }}
                    renderInput={(params) => (
                      <TextField 
                        {...params} 
                        fullWidth 
                        error={formik.touched.pickup_date && Boolean(formik.errors.pickup_date)}
                        helperText={formik.touched.pickup_date && formik.errors.pickup_date}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TimePicker
                    label="Pickup Time"
                    value={moment(formik.values.pickup_time, 'HH:mm')}
                    onChange={(time) => {
                      formik.setFieldValue('pickup_time', time.format('HH:mm'));
                      handleDateChange();
                    }}
                    renderInput={(params) => (
                      <TextField 
                        {...params} 
                        fullWidth 
                        error={formik.touched.pickup_time && Boolean(formik.errors.pickup_time)}
                        helperText={formik.touched.pickup_time && formik.errors.pickup_time}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <DatePicker
                    label="Return Date"
                    value={moment(formik.values.return_date)}
                    onChange={(date) => {
                      formik.setFieldValue('return_date', date.format('YYYY-MM-DD'));
                      handleDateChange();
                    }}
                    renderInput={(params) => (
                      <TextField 
                        {...params} 
                        fullWidth 
                        error={formik.touched.return_date && Boolean(formik.errors.return_date)}
                        helperText={formik.touched.return_date && formik.errors.return_date}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TimePicker
                    label="Return Time"
                    value={moment(formik.values.return_time, 'HH:mm')}
                    onChange={(time) => {
                      formik.setFieldValue('return_time', time.format('HH:mm'));
                      handleDateChange();
                    }}
                    renderInput={(params) => (
                      <TextField 
                        {...params} 
                        fullWidth 
                        error={formik.touched.return_time && Boolean(formik.errors.return_time)}
                        helperText={formik.touched.return_time && formik.errors.return_time}
                      />
                    )}
                  />
                </Grid>
              </LocalizationProvider>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  id="pickup_location"
                  name="pickup_location"
                  label="Pickup Location"
                  variant="outlined"
                  value={formik.values.pickup_location}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.pickup_location && Boolean(formik.errors.pickup_location)}
                  helperText={formik.touched.pickup_location && formik.errors.pickup_location}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  id="return_location"
                  name="return_location"
                  label="Return Location"
                  variant="outlined"
                  value={formik.values.return_location}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.return_location && Boolean(formik.errors.return_location)}
                  helperText={formik.touched.return_location && formik.errors.return_location}
                />
              </Grid>
            </Grid>
          )}

          {activeStep === 1 && (
            <Grid container spacing={3}>
              {checkingAvailability ? (
                <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center' }}>
                  <CircularProgress />
                </Grid>
              ) : (
                <>
                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom>
                      Available Vehicles
                    </Typography>
                    {availableVehicles.length === 0 ? (
                      <Alert severity="warning">
                        No vehicles available for the selected dates and times.
                      </Alert>
                    ) : (
                      <FormControl 
                        fullWidth 
                        error={formik.touched.vehicle_id && Boolean(formik.errors.vehicle_id)}
                      >
                        <InputLabel id="vehicle-label">Select Vehicle</InputLabel>
                        <Select
                          labelId="vehicle-label"
                          id="vehicle_id"
                          name="vehicle_id"
                          value={formik.values.vehicle_id}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          label="Select Vehicle"
                        >
                          {availableVehicles.map((vehicle) => {
                            const vehicleModel = vehicles.find(v => v.id === vehicle.id)?.model_name || 'Unknown Model';
                            return (
                              <MenuItem key={vehicle.id} value={vehicle.id}>
                                {vehicle.license_plate} - {vehicleModel} (${vehicle.daily_rate}/day)
                              </MenuItem>
                            );
                          })}
                        </Select>
                        {formik.touched.vehicle_id && formik.errors.vehicle_id && (
                          <FormHelperText>{formik.errors.vehicle_id}</FormHelperText>
                        )}
                      </FormControl>
                    )}
                  </Grid>
                  
                  {formik.values.vehicle_id && (
                    <Grid item xs={12}>
                      <Card variant="outlined">
                        <CardContent>
                          <Typography variant="h6" gutterBottom>
                            Selected Vehicle Details
                          </Typography>
                          {(() => {
                            const vehicle = vehicles.find(v => v.id === parseInt(formik.values.vehicle_id));
                            if (!vehicle) return null;
                            
                            const rentalDays = moment(formik.values.return_date).diff(moment(formik.values.pickup_date), 'days') + 1;
                            const estimatedCost = vehicle.daily_rate * rentalDays;
                            
                            // Update total amount
                            formik.setFieldValue('total_amount', estimatedCost);
                            
                            return (
                              <Grid container spacing={2}>
                                <Grid item xs={6}>
                                  <Typography variant="body2" color="textSecondary">
                                    License Plate:
                                  </Typography>
                                  <Typography variant="body1">
                                    {vehicle.license_plate}
                                  </Typography>
                                </Grid>
                                <Grid item xs={6}>
                                  <Typography variant="body2" color="textSecondary">
                                    Model:
                                  </Typography>
                                  <Typography variant="body1">
                                    {vehicle.model_name}
                                  </Typography>
                                </Grid>
                                <Grid item xs={6}>
                                  <Typography variant="body2" color="textSecondary">
                                    Daily Rate:
                                  </Typography>
                                  <Typography variant="body1">
                                    ${vehicle.daily_rate}
                                  </Typography>
                                </Grid>
                                <Grid item xs={6}>
                                  <Typography variant="body2" color="textSecondary">
                                    Rental Days:
                                  </Typography>
                                  <Typography variant="body1">
                                    {rentalDays} days
                                  </Typography>
                                </Grid>
                                <Grid item xs={12}>
                                  <Divider sx={{ my: 1 }} />
                                  <Typography variant="h6" color="primary">
                                    Estimated Cost: ${estimatedCost}
                                  </Typography>
                                </Grid>
                              </Grid>
                            );
                          })()}
                        </CardContent>
                      </Card>
                    </Grid>
                  )}
                </>
              )}
            </Grid>
          )}

          {activeStep === 2 && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel id="driver-label">Driver (Optional)</InputLabel>
                  <Select
                    labelId="driver-label"
                    id="driver_id"
                    name="driver_id"
                    value={formik.values.driver_id || ''}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    label="Driver (Optional)"
                  >
                    <MenuItem value="">No Driver</MenuItem>
                    {availableDrivers.map((driver) => (
                      <MenuItem key={driver.id} value={driver.id}>
                        {driver.name} - {driver.languages || 'No languages specified'}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControl 
                  fullWidth 
                  error={formik.touched.payment_status && Boolean(formik.errors.payment_status)}
                >
                  <InputLabel id="payment-status-label">Payment Status</InputLabel>
                  <Select
                    labelId="payment-status-label"
                    id="payment_status"
                    name="payment_status"
                    value={formik.values.payment_status}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    label="Payment Status"
                  >
                    <MenuItem value="paid">Paid</MenuItem>
                    <MenuItem value="pending">Pending</MenuItem>
                    <MenuItem value="hold">Hold</MenuItem>
                  </Select>
                  {formik.touched.payment_status && formik.errors.payment_status && (
                    <FormHelperText>{formik.errors.payment_status}</FormHelperText>
                  )}
                </FormControl>
              </Grid>
              
              {formik.values.payment_status === 'paid' && (
                <Grid item xs={12} md={6}>
                  <FormControl 
                    fullWidth 
                    error={formik.touched.payment_method && Boolean(formik.errors.payment_method)}
                  >
                    <InputLabel id="payment-method-label">Payment Method</InputLabel>
                    <Select
                      labelId="payment-method-label"
                      id="payment_method"
                      name="payment_method"
                      value={formik.values.payment_method}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      label="Payment Method"
                    >
                      <MenuItem value="cash">Cash</MenuItem>
                      <MenuItem value="credit_card">Credit Card</MenuItem>
                      <MenuItem value="bank_transfer">Bank Transfer</MenuItem>
                    </Select>
                    {formik.touched.payment_method && formik.errors.payment_method && (
                      <FormHelperText>{formik.errors.payment_method}</FormHelperText>
                    )}
                  </FormControl>
                </Grid>
              )}
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  id="total_amount"
                  name="total_amount"
                  label="Total Amount"
                  type="number"
                  variant="outlined"
                  value={formik.values.total_amount}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.total_amount && Boolean(formik.errors.total_amount)}
                  helperText={formik.touched.total_amount && formik.errors.total_amount}
                  InputProps={{
                    startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>,
                  }}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="notes"
                  name="notes"
                  label="Notes"
                  multiline
                  rows={4}
                  variant="outlined"
                  value={formik.values.notes}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
              </Grid>
            </Grid>
          )}

          {activeStep === 3 && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Booking Summary
                </Typography>
                <Card variant="outlined">
                  <CardContent>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <Typography variant="body2" color="textSecondary">
                          Customer:
                        </Typography>
                        <Typography variant="body1">
                          {customers.find(c => c.id === parseInt(formik.values.customer_id))?.full_name || 'Unknown Customer'}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Typography variant="body2" color="textSecondary">
                          Vehicle:
                        </Typography>
                        <Typography variant="body1">
                          {vehicles.find(v => v.id === parseInt(formik.values.vehicle_id))?.license_plate || 'Unknown Vehicle'}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Typography variant="body2" color="textSecondary">
                          Pickup:
                        </Typography>
                        <Typography variant="body1">
                          {moment(formik.values.pickup_date).format('MMM D, YYYY')} at {formik.values.pickup_time}
                        </Typography>
                        <Typography variant="body2">
                          {formik.values.pickup_location}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Typography variant="body2" color="textSecondary">
                          Return:
                        </Typography>
                        <Typography variant="body1">
                          {moment(formik.values.return_date).format('MMM D, YYYY')} at {formik.values.return_time}
                        </Typography>
                        <Typography variant="body2">
                          {formik.values.return_location}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Typography variant="body2" color="textSecondary">
                          Driver:
                        </Typography>
                        <Typography variant="body1">
                          {formik.values.driver_id 
                            ? drivers.find(d => d.id === parseInt(formik.values.driver_id))?.name 
                            : 'No Driver'}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Typography variant="body2" color="textSecondary">
                          Payment Status:
                        </Typography>
                        <Typography variant="body1" sx={{ 
                          color: formik.values.payment_status === 'paid' 
                            ? 'success.main' 
                            : formik.values.payment_status === 'pending' 
                              ? 'warning.main' 
                              : 'error.main'
                        }}>
                          {formik.values.payment_status.toUpperCase()}
                          {formik.values.payment_status === 'paid' && formik.values.payment_method && (
                            ` (${formik.values.payment_method.replace('_', ' ')})`
                          )}
                        </Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <Divider sx={{ my: 1 }} />
                        <Typography variant="h6" color="primary">
                          Total Amount: ${formik.values.total_amount}
                        </Typography>
                      </Grid>
                      {formik.values.notes && (
                        <Grid item xs={12}>
                          <Typography variant="body2" color="textSecondary">
                            Notes:
                          </Typography>
                          <Typography variant="body2">
                            {formik.values.notes}
                          </Typography>
                        </Grid>
                      )}
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
            <Button
              variant="outlined"
              onClick={() => navigate('/bookings')}
              sx={{ mr: 1 }}
            >
              Cancel
            </Button>
            {activeStep > 0 && (
              <Button 
                variant="outlined" 
                onClick={handleBack}
                sx={{ mr: 1 }}
              >
                Back
              </Button>
            )}
            <Button 
              type="submit" 
              variant="contained" 
              color="primary"
              disabled={formik.isSubmitting}
            >
              {activeStep === steps.length - 1 
                ? (formik.isSubmitting ? 'Saving...' : isEditMode ? 'Update Booking' : 'Create Booking')
                : 'Next'}
            </Button>
          </Box>
        </form>
      </Paper>

      {/* Conflict Dialog */}
      <Dialog open={conflictDialogOpen} onClose={closeConflictDialog}>
        <DialogTitle>Vehicle Availability Conflict</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            The selected vehicle is not available for the chosen dates and times due to the following conflicts:
          </Typography>
          {conflicts.map((conflict, index) => (
            <Typography key={index} variant="body2" sx={{ mb: 1 }}>
              • Booking {conflict.booking_id}: {moment(conflict.pickup_date).format('MMM D')} {conflict.pickup_time} - {moment(conflict.return_date).format('MMM D')} {conflict.return_time}
            </Typography>
          ))}
          <Typography sx={{ mt: 2 }}>
            Please select a different vehicle or change the booking dates.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeConflictDialog}>OK</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BookingForm;
