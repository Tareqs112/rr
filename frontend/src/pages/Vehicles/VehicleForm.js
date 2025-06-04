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
  FormHelperText
} from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useNavigate, useParams } from 'react-router-dom';
import vehicleService from '../../services/vehicles';
import moment from 'moment';

const VehicleForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(id ? true : false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [vehicleModels, setVehicleModels] = useState([]);
  const isEditMode = Boolean(id);

  const validationSchema = Yup.object({
    model_id: Yup.number().required('Vehicle model is required'),
    license_plate: Yup.string().required('License plate is required'),
    insurance_expiry: Yup.date().required('Insurance expiry date is required'),
    license_expiry: Yup.date().required('License expiry date is required'),
    status: Yup.string().oneOf(['available', 'booked', 'maintenance'], 'Invalid status').required('Status is required')
  });

  const formik = useFormik({
    initialValues: {
      model_id: '',
      license_plate: '',
      insurance_expiry: moment().format('YYYY-MM-DD'),
      license_expiry: moment().format('YYYY-MM-DD'),
      status: 'available'
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        if (isEditMode) {
          await vehicleService.updateVehicle(id, values);
          setSuccess('Vehicle updated successfully');
        } else {
          await vehicleService.createVehicle(values);
          setSuccess('Vehicle created successfully');
          formik.resetForm();
        }
        
        // Navigate back after a short delay
        setTimeout(() => {
          navigate('/vehicles');
        }, 1500);
      } catch (err) {
        setError(err.response?.data?.message || 'An error occurred');
        console.error(err);
      }
    }
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch vehicle models
        const modelsResponse = await vehicleService.getAllVehicleModels();
        setVehicleModels(modelsResponse.models);
        
        // If editing, fetch vehicle details
        if (id) {
          setLoading(true);
          const vehicleResponse = await vehicleService.getVehicleById(id);
          const vehicle = vehicleResponse.vehicle;
          
          formik.setValues({
            model_id: vehicle.model_id || '',
            license_plate: vehicle.license_plate || '',
            insurance_expiry: moment(vehicle.insurance_expiry).format('YYYY-MM-DD'),
            license_expiry: moment(vehicle.license_expiry).format('YYYY-MM-DD'),
            status: vehicle.status || 'available'
          });
          setLoading(false);
        }
      } catch (err) {
        setError('Failed to fetch data');
        console.error(err);
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

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
        {isEditMode ? 'Edit Vehicle' : 'Add New Vehicle'}
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

      <Paper sx={{ p: 3 }}>
        <form onSubmit={formik.handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <FormControl 
                fullWidth 
                error={formik.touched.model_id && Boolean(formik.errors.model_id)}
              >
                <InputLabel id="model-label">Vehicle Model</InputLabel>
                <Select
                  labelId="model-label"
                  id="model_id"
                  name="model_id"
                  value={formik.values.model_id}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  label="Vehicle Model"
                >
                  {vehicleModels.map((model) => (
                    <MenuItem key={model.id} value={model.id}>
                      {model.name}
                    </MenuItem>
                  ))}
                </Select>
                {formik.touched.model_id && formik.errors.model_id && (
                  <FormHelperText>{formik.errors.model_id}</FormHelperText>
                )}
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                id="license_plate"
                name="license_plate"
                label="License Plate"
                variant="outlined"
                value={formik.values.license_plate}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.license_plate && Boolean(formik.errors.license_plate)}
                helperText={formik.touched.license_plate && formik.errors.license_plate}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                id="insurance_expiry"
                name="insurance_expiry"
                label="Insurance Expiry Date"
                type="date"
                variant="outlined"
                value={formik.values.insurance_expiry}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.insurance_expiry && Boolean(formik.errors.insurance_expiry)}
                helperText={formik.touched.insurance_expiry && formik.errors.insurance_expiry}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                id="license_expiry"
                name="license_expiry"
                label="License Expiry Date"
                type="date"
                variant="outlined"
                value={formik.values.license_expiry}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.license_expiry && Boolean(formik.errors.license_expiry)}
                helperText={formik.touched.license_expiry && formik.errors.license_expiry}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl 
                fullWidth 
                error={formik.touched.status && Boolean(formik.errors.status)}
              >
                <InputLabel id="status-label">Status</InputLabel>
                <Select
                  labelId="status-label"
                  id="status"
                  name="status"
                  value={formik.values.status}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  label="Status"
                >
                  <MenuItem value="available">Available</MenuItem>
                  <MenuItem value="booked">Booked</MenuItem>
                  <MenuItem value="maintenance">Maintenance</MenuItem>
                </Select>
                {formik.touched.status && formik.errors.status && (
                  <FormHelperText>{formik.errors.status}</FormHelperText>
                )}
              </FormControl>
            </Grid>
            <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button 
                variant="outlined" 
                onClick={() => navigate('/vehicles')}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                variant="contained" 
                color="primary"
                disabled={formik.isSubmitting}
              >
                {formik.isSubmitting ? 'Saving...' : isEditMode ? 'Update Vehicle' : 'Add Vehicle'}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default VehicleForm;
